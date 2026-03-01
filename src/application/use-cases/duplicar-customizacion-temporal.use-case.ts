import { CustomizacionTemporalRepositoryPort } from '@domain/ports/customizacion-temporal.repository.port';
import { EditorType } from '@domain/entities/customizacion-temporal.entity';

const CART_ITEM_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const MAX_INSTANCE_INDEX = 99;

export interface DuplicarCustomizacionResult {
  success: boolean;
  data?: {
    cartItemId: string;
    sourceInstanceIndex: number;
    targetInstanceIndex: number;
    editorType: string;
    completed: boolean;
    createdAt: string;
  };
  error?: string;
  message: string;
  details?: Record<string, unknown>;
}

export class DuplicarCustomizacionTemporalUseCase {
  constructor(
    private readonly customizacionRepo: CustomizacionTemporalRepositoryPort
  ) {}

  async execute(
    userId: number,
    cartItemId: string,
    sourceInstanceIndex: number,
    targetInstanceIndex?: number
  ): Promise<DuplicarCustomizacionResult> {
    // Validate cartItemId format
    if (!CART_ITEM_ID_REGEX.test(cartItemId)) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'El formato de cartItemId es inválido',
        details: { cartItemId }
      };
    }

    // Validate sourceInstanceIndex
    if (!Number.isInteger(sourceInstanceIndex) || sourceInstanceIndex < 0) {
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'sourceInstanceIndex debe ser un entero mayor o igual a 0',
        details: { sourceInstanceIndex }
      };
    }

    // Fetch source customization
    const source = await this.customizacionRepo.findByCartItemId(userId, cartItemId, sourceInstanceIndex);
    if (!source) {
      return {
        success: false,
        error: 'CUSTOMIZATION_NOT_FOUND',
        message: 'No se encontró la customización fuente',
        details: { cartItemId, sourceInstanceIndex }
      };
    }

    // Determine targetInstanceIndex
    let resolvedTargetIndex: number;
    if (targetInstanceIndex !== undefined) {
      if (!Number.isInteger(targetInstanceIndex) || targetInstanceIndex < 1) {
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'targetInstanceIndex debe ser un entero mayor o igual a 1',
          details: { targetInstanceIndex }
        };
      }
      resolvedTargetIndex = targetInstanceIndex;
    } else {
      const maxIndex = await this.customizacionRepo.findMaxInstanceIndex(userId, cartItemId);
      resolvedTargetIndex = maxIndex + 1;
    }

    // Validate upper bound
    if (resolvedTargetIndex > MAX_INSTANCE_INDEX) {
      return {
        success: false,
        error: 'MAX_INSTANCES_EXCEEDED',
        message: `El índice de instancia no puede superar ${MAX_INSTANCE_INDEX}`,
        details: { targetInstanceIndex: resolvedTargetIndex, max: MAX_INSTANCE_INDEX }
      };
    }

    // Check target slot is free
    const existing = await this.customizacionRepo.findByCartItemId(userId, cartItemId, resolvedTargetIndex);
    if (existing) {
      return {
        success: false,
        error: 'INSTANCE_ALREADY_EXISTS',
        message: 'Ya existe una customización en el índice de destino',
        details: { cartItemId, targetInstanceIndex: resolvedTargetIndex }
      };
    }

    // Sanitize datos — strip rendered/preview blobs
    const sanitizedDatos = this.sanitizeDatos(source.datos, source.editor_type);

    // Create clone
    try {
      const clone = await this.customizacionRepo.createClone(
        userId,
        cartItemId,
        resolvedTargetIndex,
        sanitizedDatos,
        source.editor_type,
        source.completed
      );

      return {
        success: true,
        data: {
          cartItemId: clone.cart_item_id,
          sourceInstanceIndex,
          targetInstanceIndex: clone.instance_index,
          editorType: clone.editor_type,
          completed: clone.completed,
          createdAt: clone.created_at?.toISOString() ?? new Date().toISOString()
        },
        message: 'Customización duplicada exitosamente'
      };
    } catch (error: any) {
      if (error?.message === 'DUPLICATE_INSTANCE_INDEX') {
        return {
          success: false,
          error: 'INSTANCE_ALREADY_EXISTS',
          message: 'Ya existe una customización en el índice de destino',
          details: { cartItemId, targetInstanceIndex: resolvedTargetIndex }
        };
      }
      throw error;
    }
  }

  private sanitizeDatos(datos: any, editorType: EditorType): any {
    const clone = structuredClone(datos);

    const stripImageFields = (img: any) => {
      delete img.renderedImageSrc;
      delete img.thumbnailDataUrl;
      delete img.croppedPhotoSrc;
    };

    if (editorType === EditorType.STANDARD && Array.isArray(clone.images)) {
      clone.images.forEach(stripImageFields);
    } else if (editorType === EditorType.CALENDAR && Array.isArray(clone.months)) {
      clone.months.forEach((month: any) => {
        if (Array.isArray(month.images)) month.images.forEach(stripImageFields);
      });
    } else if (editorType === EditorType.POLAROID && Array.isArray(clone.polaroids)) {
      clone.polaroids.forEach((polaroid: any) => {
        if (Array.isArray(polaroid.images)) polaroid.images.forEach(stripImageFields);
        else stripImageFields(polaroid);
      });
    }

    return clone;
  }
}
