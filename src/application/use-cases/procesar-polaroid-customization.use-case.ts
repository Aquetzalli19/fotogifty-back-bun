import { PolaroidProcessingService, PolaroidCustomizationData, ProcessedPolaroidResult } from '@infrastructure/services/polaroid-processing.service';
import { S3Service } from '@infrastructure/services/s3.service';

interface ProcesarPolaroidCustomizationResult {
  success: boolean;
  data?: {
    processedImages: {
      s3Key: string;
      s3Url: string;
      width: number;
      height: number;
      copies: number;
    }[];
  };
  message?: string;
  error?: string;
}

export class ProcesarPolaroidCustomizationUseCase {
  private polaroidService: PolaroidProcessingService;
  private s3Service: S3Service;

  constructor() {
    this.polaroidService = new PolaroidProcessingService();
    this.s3Service = new S3Service();
  }

  /**
   * Procesa una customización de polaroid y sube las imágenes procesadas a S3
   */
  async execute(
    customizationData: PolaroidCustomizationData,
    pedidoId: number,
    itemPedidoId: number
  ): Promise<ProcesarPolaroidCustomizationResult> {
    try {
      // 1. Validar datos de entrada
      if (!this.polaroidService.validateCustomizationData(customizationData)) {
        return {
          success: false,
          message: 'Datos de customización inválidos',
          error: 'Datos de customización inválidos'
        };
      }

      // 2. Procesar todas las polaroids
      const processedResults: ProcessedPolaroidResult[] = await this.polaroidService.processCustomization(
        customizationData
      );

      // 3. Subir cada imagen procesada a S3
      const uploadedImages = [];

      for (let i = 0; i < processedResults.length; i++) {
        const processed = processedResults[i];
        const timestamp = Date.now();
        const key = `pedidos/${pedidoId}/items/${itemPedidoId}/polaroid_${timestamp}_${i}.png`;

        // Subir a S3
        const s3Url = await this.s3Service.uploadBuffer(
          processed.buffer,
          key,
          'image/png'
        );

        uploadedImages.push({
          s3Key: key,
          s3Url,
          width: processed.width,
          height: processed.height,
          copies: processed.copies
        });
      }

      return {
        success: true,
        data: {
          processedImages: uploadedImages
        },
        message: `${uploadedImages.length} polaroid(s) procesados exitosamente`
      };
    } catch (error: any) {
      console.error('Error procesando polaroid customization:', error);
      return {
        success: false,
        message: error.message || 'Error al procesar la customización de polaroid',
        error: error.message
      };
    }
  }

  /**
   * Procesa múltiples customizaciones de polaroid (por si hay varios items)
   */
  async executeMultiple(
    customizations: Array<{
      data: PolaroidCustomizationData;
      pedidoId: number;
      itemPedidoId: number;
    }>
  ): Promise<ProcesarPolaroidCustomizationResult[]> {
    const results: ProcesarPolaroidCustomizationResult[] = [];

    for (const customization of customizations) {
      const result = await this.execute(
        customization.data,
        customization.pedidoId,
        customization.itemPedidoId
      );
      results.push(result);
    }

    return results;
  }
}
