import { CustomizacionTemporalRepositoryPort } from '@domain/ports/customizacion-temporal.repository.port';
import { CustomizacionTemporalEntity, CustomizacionData, EditorType } from '@domain/entities/customizacion-temporal.entity';

interface GuardarCustomizacionTemporalResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class GuardarCustomizacionTemporalUseCase {
  constructor(
    private readonly customizacionTemporalRepository: CustomizacionTemporalRepositoryPort
  ) {}

  async execute(
    usuarioId: number,
    cartItemId: string,
    instanceIndex: number,
    editorType: EditorType,
    datos: CustomizacionData,
    completed: boolean = false
  ): Promise<GuardarCustomizacionTemporalResult> {
    try {
      // 1. Validaciones
      if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
        return {
          success: false,
          message: 'ID de usuario inválido',
          error: 'ID de usuario inválido'
        };
      }

      if (!cartItemId || typeof cartItemId !== 'string') {
        return {
          success: false,
          message: 'ID de item del carrito inválido',
          error: 'ID de item del carrito inválido'
        };
      }

      if (typeof instanceIndex !== 'number' || instanceIndex < 0) {
        return {
          success: false,
          message: 'Índice de instancia inválido',
          error: 'Índice de instancia inválido'
        };
      }

      if (!datos || typeof datos !== 'object') {
        return {
          success: false,
          message: 'Datos de customización inválidos',
          error: 'Datos de customización inválidos'
        };
      }

      // Validar estructura según el tipo de editor
      const hasValidContent =
        (editorType === 'standard' && Array.isArray(datos.images)) ||
        (editorType === 'polaroid' && Array.isArray(datos.polaroids)) ||
        (editorType === 'calendar' && (Array.isArray(datos.months) || Array.isArray(datos.images)));

      if (!hasValidContent) {
        return {
          success: false,
          message: 'Datos de customización inválidos para el tipo de editor',
          error: 'Datos de customización inválidos para el tipo de editor'
        };
      }

      // 2. Verificar si ya existe
      const existente = await this.customizacionTemporalRepository.findByCartItemId(
        usuarioId,
        cartItemId,
        instanceIndex
      );

      if (existente) {
        // Actualizar
        await this.customizacionTemporalRepository.update(
          usuarioId,
          cartItemId,
          instanceIndex,
          datos,
          editorType,
          completed
        );
      } else {
        // Crear
        const nuevaCustomizacion = CustomizacionTemporalEntity.create(
          usuarioId,
          cartItemId,
          instanceIndex,
          editorType,
          datos,
          completed
        );
        await this.customizacionTemporalRepository.save(nuevaCustomizacion);
      }

      return {
        success: true,
        message: 'Customización guardada correctamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al guardar la customización temporal',
        error: error.message
      };
    }
  }
}
