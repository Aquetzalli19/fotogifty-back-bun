import sharp from 'sharp';

export interface ImageMetadata {
  width: number;           // Ancho en píxeles
  height: number;          // Alto en píxeles
  format: string;          // jpg, png, etc
  size: number;            // Tamaño del archivo en bytes
  dpi?: number;            // DPI extraído del archivo
  physicalWidth?: number;  // Ancho físico en cm (si hay DPI)
  physicalHeight?: number; // Alto físico en cm (si hay DPI)
}

export interface ImageValidationResult {
  isValid: boolean;
  metadata: ImageMetadata;
  errors: string[];
  warnings: string[];
}

export interface ValidationRequirements {
  minWidth?: number;       // Píxeles mínimos de ancho
  minHeight?: number;      // Píxeles mínimos de alto
  minDPI?: number;         // DPI mínimo requerido (típicamente 300)
  maxFileSize?: number;    // Tamaño máximo en bytes
  allowedFormats?: string[]; // Formatos permitidos ['jpeg', 'jpg', 'png']
  expectedWidth?: number;   // Ancho esperado en cm
  expectedHeight?: number;  // Alto esperado en cm
  tolerance?: number;       // Tolerancia en cm (default: 0.5cm)
}

export class ImageValidationService {
  /**
   * Extrae metadatos de una imagen
   */
  static async extractMetadata(buffer: Buffer): Promise<ImageMetadata> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Sharp proporciona density (DPI) si está en los metadatos
    const dpi = metadata.density;

    // Calcular tamaño físico si tenemos DPI
    let physicalWidth: number | undefined;
    let physicalHeight: number | undefined;

    if (dpi && metadata.width && metadata.height) {
      // DPI to cm: 1 inch = 2.54 cm
      physicalWidth = (metadata.width / dpi) * 2.54;
      physicalHeight = (metadata.height / dpi) * 2.54;
    }

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: metadata.size || 0,
      dpi,
      physicalWidth,
      physicalHeight
    };
  }

  /**
   * Valida una imagen contra requisitos específicos
   */
  static async validateImage(
    buffer: Buffer,
    requirements: ValidationRequirements
  ): Promise<ImageValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const metadata = await this.extractMetadata(buffer);

      // Validar formato
      if (requirements.allowedFormats) {
        const formatLower = metadata.format.toLowerCase();
        // Normalizar jpeg/jpg
        const normalizedFormat = formatLower === 'jpeg' ? 'jpg' : formatLower;
        const allowedNormalized = requirements.allowedFormats.map(f =>
          f.toLowerCase() === 'jpeg' ? 'jpg' : f.toLowerCase()
        );

        if (!allowedNormalized.includes(normalizedFormat)) {
          errors.push(
            `Formato no permitido. Se esperaba: ${requirements.allowedFormats.join(', ')}. ` +
            `Se recibió: ${metadata.format}`
          );
        }
      }

      // Validar tamaño de archivo
      if (requirements.maxFileSize && metadata.size > requirements.maxFileSize) {
        errors.push(
          `Archivo muy grande. Máximo: ${(requirements.maxFileSize / 1024 / 1024).toFixed(2)}MB. ` +
          `Actual: ${(metadata.size / 1024 / 1024).toFixed(2)}MB`
        );
      }

      // Validar dimensiones en píxeles
      if (requirements.minWidth && metadata.width < requirements.minWidth) {
        errors.push(
          `Ancho insuficiente. Mínimo: ${requirements.minWidth}px. Actual: ${metadata.width}px`
        );
      }

      if (requirements.minHeight && metadata.height < requirements.minHeight) {
        errors.push(
          `Alto insuficiente. Mínimo: ${requirements.minHeight}px. Actual: ${metadata.height}px`
        );
      }

      // Validar DPI
      if (!metadata.dpi) {
        warnings.push(
          'La imagen no tiene metadatos DPI. Se asumirá 300 DPI para impresión.'
        );
      } else if (requirements.minDPI && metadata.dpi < requirements.minDPI) {
        warnings.push(
          `DPI bajo. Recomendado: ${requirements.minDPI} DPI. Actual: ${metadata.dpi} DPI. ` +
          `La impresión puede no tener la calidad esperada.`
        );
      }

      // Validar dimensiones físicas esperadas
      if (requirements.expectedWidth && requirements.expectedHeight) {
        const tolerance = requirements.tolerance || 0.5; // 0.5cm por defecto
        const dpi = metadata.dpi || 300; // Asumir 300 si no hay DPI

        // Calcular dimensiones físicas con el DPI actual o asumido
        const actualPhysicalWidth = (metadata.width / dpi) * 2.54;
        const actualPhysicalHeight = (metadata.height / dpi) * 2.54;

        // Verificar si las dimensiones están dentro de la tolerancia
        const widthDiff = Math.abs(actualPhysicalWidth - requirements.expectedWidth);
        const heightDiff = Math.abs(actualPhysicalHeight - requirements.expectedHeight);

        if (widthDiff > tolerance || heightDiff > tolerance) {
          // Calcular los píxeles necesarios para las dimensiones esperadas
          const requiredWidth = Math.ceil((requirements.expectedWidth / 2.54) * dpi);
          const requiredHeight = Math.ceil((requirements.expectedHeight / 2.54) * dpi);

          warnings.push(
            `Dimensiones físicas no coinciden con lo esperado. ` +
            `Esperado: ${requirements.expectedWidth.toFixed(1)}cm x ${requirements.expectedHeight.toFixed(1)}cm. ` +
            `Actual: ${actualPhysicalWidth.toFixed(1)}cm x ${actualPhysicalHeight.toFixed(1)}cm ` +
            `(a ${dpi} DPI). ` +
            `Se recomienda una imagen de ${requiredWidth}x${requiredHeight} píxeles a ${dpi} DPI.`
          );
        }
      }

      // Advertencia sobre resolución para impresión
      if (requirements.minDPI === 300 && metadata.dpi && metadata.dpi < 300) {
        const minPixelsWidth = requirements.expectedWidth
          ? Math.ceil((requirements.expectedWidth / 2.54) * 300)
          : metadata.width * (300 / metadata.dpi);
        const minPixelsHeight = requirements.expectedHeight
          ? Math.ceil((requirements.expectedHeight / 2.54) * 300)
          : metadata.height * (300 / metadata.dpi);

        warnings.push(
          `Para impresión de alta calidad a 300 DPI, se recomienda una imagen de ` +
          `al menos ${Math.ceil(minPixelsWidth)}x${Math.ceil(minPixelsHeight)} píxeles.`
        );
      }

      return {
        isValid: errors.length === 0,
        metadata,
        errors,
        warnings
      };
    } catch (error: any) {
      return {
        isValid: false,
        metadata: {
          width: 0,
          height: 0,
          format: 'unknown',
          size: 0
        },
        errors: [`Error al procesar imagen: ${error.message}`],
        warnings: []
      };
    }
  }

  /**
   * Calcula los píxeles necesarios para un tamaño físico a cierto DPI
   */
  static calculateRequiredPixels(
    widthCm: number,
    heightCm: number,
    dpi: number = 300
  ): { width: number; height: number } {
    // Convertir cm a pulgadas (1 inch = 2.54 cm)
    const widthInches = widthCm / 2.54;
    const heightInches = heightCm / 2.54;

    // Calcular píxeles necesarios
    return {
      width: Math.ceil(widthInches * dpi),
      height: Math.ceil(heightInches * dpi)
    };
  }

  /**
   * Calcula el tamaño físico de impresión
   */
  static calculatePhysicalSize(
    widthPixels: number,
    heightPixels: number,
    dpi: number = 300
  ): { widthCm: number; heightCm: number } {
    // Calcular pulgadas
    const widthInches = widthPixels / dpi;
    const heightInches = heightPixels / dpi;

    // Convertir a cm
    return {
      widthCm: widthInches * 2.54,
      heightCm: heightInches * 2.54
    };
  }

  /**
   * Embebe metadatos DPI en la imagen
   * Retorna un nuevo buffer con los DPI correctos
   */
  static async embedDPI(
    buffer: Buffer,
    dpi: number = 300
  ): Promise<{ buffer: Buffer; format: string }> {
    // Sharp permite configurar la densidad (DPI) al procesar
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Determinar el formato de salida
    const format = metadata.format || 'jpeg';

    // IMPORTANTE: Primero remover metadatos existentes para evitar conflictos
    // Luego agregar solo density (Sharp lo maneja correctamente)
    let processedImage = image
      .withMetadata(false)  // Remover EXIF problemáticos del navegador
      .withMetadata({
        density: dpi  // Sharp maneja esto correctamente internamente
      });

    // Convertir según el formato
    let outputBuffer: Buffer;
    if (format === 'png') {
      outputBuffer = await processedImage
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true
        })
        .toBuffer();
    } else {
      // JPEG por defecto (incluye 'jpeg', 'jpg')
      outputBuffer = await processedImage
        .jpeg({
          quality: 95, // Alta calidad para impresión
          chromaSubsampling: '4:4:4', // Máxima calidad de color
          mozjpeg: true // Optimización con mozjpeg
        })
        .toBuffer();
    }

    return {
      buffer: outputBuffer,
      format: format === 'png' ? 'png' : 'jpg'
    };
  }
}
