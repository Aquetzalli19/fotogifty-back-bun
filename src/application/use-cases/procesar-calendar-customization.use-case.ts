import { CalendarProcessingService, CalendarCustomizationData, ProcessedCalendarResult } from '@infrastructure/services/calendar-processing.service';
import { S3Service } from '@infrastructure/services/s3.service';

interface ProcesarCalendarCustomizationResult {
  success: boolean;
  data?: {
    processedMonths: {
      month: number;
      s3Key: string;
      s3Url: string;
      width: number;
      height: number;
    }[];
  };
  message?: string;
  error?: string;
}

export class ProcesarCalendarCustomizationUseCase {
  private calendarService: CalendarProcessingService;
  private s3Service: S3Service;

  constructor() {
    this.calendarService = new CalendarProcessingService();
    this.s3Service = new S3Service();
  }

  /**
   * Procesa una customización de calendario y sube las imágenes procesadas a S3
   */
  async execute(
    customizationData: CalendarCustomizationData,
    pedidoId: number,
    itemPedidoId: number
  ): Promise<ProcesarCalendarCustomizationResult> {
    try {
      // 1. Validar datos de entrada
      if (!this.calendarService.validateCustomizationData(customizationData)) {
        return {
          success: false,
          message: 'Datos de customización de calendario inválidos',
          error: 'Datos de customización inválidos'
        };
      }

      // 2. Procesar todos los meses del calendario
      const processedResults: ProcessedCalendarResult[] = await this.calendarService.processCustomization(
        customizationData
      );

      // 3. Subir cada mes procesado a S3
      const uploadedMonths = [];

      for (const processed of processedResults) {
        const timestamp = Date.now();
        const monthName = this.getMonthName(processed.month);
        const key = `pedidos/${pedidoId}/items/${itemPedidoId}/calendar_${monthName}_${timestamp}.png`;

        // Subir a S3
        const s3Url = await this.s3Service.uploadBuffer(
          processed.buffer,
          key,
          'image/png'
        );

        uploadedMonths.push({
          month: processed.month,
          s3Key: key,
          s3Url,
          width: processed.width,
          height: processed.height
        });
      }

      return {
        success: true,
        data: {
          processedMonths: uploadedMonths
        },
        message: `${uploadedMonths.length} mes(es) de calendario procesados exitosamente`
      };
    } catch (error: any) {
      console.error('Error procesando calendar customization:', error);
      return {
        success: false,
        message: error.message || 'Error al procesar la customización de calendario',
        error: error.message
      };
    }
  }

  /**
   * Obtiene el nombre del mes en español
   */
  private getMonthName(month: number): string {
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return monthNames[month - 1] || `mes${month}`;
  }

  /**
   * Procesa múltiples customizaciones de calendario (por si hay varios items)
   */
  async executeMultiple(
    customizations: Array<{
      data: CalendarCustomizationData;
      pedidoId: number;
      itemPedidoId: number;
    }>
  ): Promise<ProcesarCalendarCustomizationResult[]> {
    const results: ProcesarCalendarCustomizationResult[] = [];

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
