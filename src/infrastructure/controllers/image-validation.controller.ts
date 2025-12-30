import { Request, Response } from 'express';
import { ImageValidationService } from '../services/image-validation.service';

export class ImageValidationController {
  /**
   * Endpoint para validar una imagen antes de subirla definitivamente
   * Útil para dar feedback al usuario antes de procesar
   */
  async validateImage(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
        return;
      }

      // Obtener requisitos del body (opcionales)
      const {
        expectedWidthCm,
        expectedHeightCm,
        minDPI = 300,
        toleranceCm = 0.5
      } = req.body;

      // Validar la imagen
      const validationResult = await ImageValidationService.validateImage(file.buffer, {
        minDPI: parseInt(minDPI),
        expectedWidth: expectedWidthCm ? parseFloat(expectedWidthCm) : undefined,
        expectedHeight: expectedHeightCm ? parseFloat(expectedHeightCm) : undefined,
        tolerance: parseFloat(toleranceCm),
        allowedFormats: ['jpg', 'jpeg', 'png'],
        maxFileSize: 10 * 1024 * 1024 // 10MB
      });

      // Calcular píxeles recomendados si se proporcionaron dimensiones esperadas
      let recommendedPixels;
      if (expectedWidthCm && expectedHeightCm) {
        recommendedPixels = ImageValidationService.calculateRequiredPixels(
          parseFloat(expectedWidthCm),
          parseFloat(expectedHeightCm),
          parseInt(minDPI)
        );
      }

      res.status(200).json({
        success: validationResult.isValid,
        isValid: validationResult.isValid,
        metadata: {
          ...validationResult.metadata,
          sizeInMB: (validationResult.metadata.size / 1024 / 1024).toFixed(2),
          physicalWidthCm: validationResult.metadata.physicalWidth?.toFixed(2),
          physicalHeightCm: validationResult.metadata.physicalHeight?.toFixed(2)
        },
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        recommendedPixels,
        message: validationResult.isValid
          ? 'Imagen válida para impresión'
          : 'Imagen no cumple con los requisitos de calidad'
      });
    } catch (error: any) {
      console.error('Error en validateImage:', error);
      res.status(500).json({
        success: false,
        message: 'Error al validar imagen',
        error: error.message
      });
    }
  }

  /**
   * Endpoint para calcular requisitos de imagen
   */
  async calculateRequirements(req: Request, res: Response): Promise<void> {
    try {
      const { widthCm, heightCm, dpi = 300 } = req.body;

      if (!widthCm || !heightCm) {
        res.status(400).json({
          success: false,
          message: 'Se requieren widthCm y heightCm'
        });
        return;
      }

      const requiredPixels = ImageValidationService.calculateRequiredPixels(
        parseFloat(widthCm),
        parseFloat(heightCm),
        parseInt(dpi)
      );

      res.status(200).json({
        success: true,
        data: {
          widthCm: parseFloat(widthCm),
          heightCm: parseFloat(heightCm),
          dpi: parseInt(dpi),
          requiredPixels,
          megapixels: ((requiredPixels.width * requiredPixels.height) / 1000000).toFixed(2),
          recommendation: `Para imprimir ${widthCm}cm x ${heightCm}cm a ${dpi} DPI, necesitas una imagen de al menos ${requiredPixels.width}x${requiredPixels.height} píxeles`
        }
      });
    } catch (error: any) {
      console.error('Error en calculateRequirements:', error);
      res.status(500).json({
        success: false,
        message: 'Error al calcular requisitos',
        error: error.message
      });
    }
  }
}
