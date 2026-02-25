import sharp, { Sharp } from 'sharp';
import { S3Service } from './s3.service';
import fetch from 'node-fetch';

export interface CalendarMonthData {
  month: number;  // 1-12
  imageSrc: string;  // data:image/jpeg;base64,... o URL
  transformations: {
    scale: number;
    rotation?: number;
    posX: number;
    posY: number;
  };
  effects: {
    brightness: number;
    contrast: number;
    saturation: number;
    sepia: number;
  };
  selectedFilter: string;
  canvasStyle?: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
}

export interface CalendarCustomizationData {
  canvasWidth: number;
  canvasHeight: number;
  widthInches?: number;
  heightInches?: number;
  exportResolution: number;

  // Templates por mes: { "1": "/calendarios2026/1-ENERO 2026.png", "2": "...", ... }
  monthTemplates: Record<string, string>;

  // Área de foto (normalmente parte superior 47%)
  photoArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  months: CalendarMonthData[];
}

export interface ProcessedCalendarResult {
  month: number;
  buffer: Buffer;
  width: number;
  height: number;
}

export class CalendarProcessingService {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  /**
   * Procesa múltiples meses de calendario según la customización
   */
  async processCustomization(
    customizationData: CalendarCustomizationData
  ): Promise<ProcessedCalendarResult[]> {
    const results: ProcessedCalendarResult[] = [];

    for (const monthData of customizationData.months) {
      const processed = await this.processSingleMonth(
        monthData,
        customizationData
      );
      results.push(processed);
    }

    return results;
  }

  /**
   * Procesa un solo mes del calendario
   */
  async processSingleMonth(
    monthData: CalendarMonthData,
    customizationData: CalendarCustomizationData
  ): Promise<ProcessedCalendarResult> {
    // 1. Obtener el template para este mes
    const templateUrl = customizationData.monthTemplates[monthData.month.toString()];

    if (!templateUrl) {
      throw new Error(`No se encontró template para el mes ${monthData.month}`);
    }

    const templateBuffer = await this.downloadTemplate(templateUrl);

    // 2. Procesar imagen del usuario
    const userImageBuffer = await this.downloadUserImage(monthData.imageSrc);
    const processedImage = await this.applyTransformationsAndEffects(
      userImageBuffer,
      monthData,
      customizationData
    );

    // 3. Calcular dimensiones finales
    const widthInches = customizationData.widthInches || 8.5;
    const heightInches = customizationData.heightInches || 11;
    const finalWidth = Math.round(widthInches * customizationData.exportResolution);
    const finalHeight = Math.round(heightInches * customizationData.exportResolution);

    // 4. Crear fondo difuminado (blur background)
    const blurredBackground = await this.createBlurredBackground(
      processedImage,
      finalWidth,
      finalHeight,
      customizationData
    );

    // 5. Combinar: fondo difuminado + imagen procesada + template
    const finalBuffer = await this.compositeCalendarWithTemplate(
      blurredBackground,
      processedImage,
      templateBuffer,
      customizationData,
      finalWidth,
      finalHeight
    );

    // 6. Asegurar 300 DPI
    const finalProcessed = await sharp(finalBuffer)
      .withMetadata({
        density: 300,
        icc: 'srgb'
      })
      .toBuffer();

    const metadata = await sharp(finalProcessed).metadata();

    return {
      month: monthData.month,
      buffer: finalProcessed,
      width: metadata.width || finalWidth,
      height: metadata.height || finalHeight
    };
  }

  /**
   * Descarga el template desde URL o S3
   */
  private async downloadTemplate(templateUrl: string): Promise<Buffer> {
    try {
      if (templateUrl.includes('s3.amazonaws.com') || templateUrl.includes('amazonaws.com')) {
        const key = this.extractS3KeyFromUrl(templateUrl);
        return await this.s3Service.downloadFile(key);
      }

      if (templateUrl.startsWith('/')) {
        const key = templateUrl.substring(1);
        return await this.s3Service.downloadFile(key);
      }

      const response = await fetch(templateUrl);
      if (!response.ok) {
        throw new Error(`Failed to download template: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      throw new Error(`Error downloading template: ${error.message}`);
    }
  }

  /**
   * Descarga la imagen del usuario (data URL o S3)
   */
  private async downloadUserImage(imageSrc: string): Promise<Buffer> {
    try {
      if (imageSrc.startsWith('data:')) {
        const base64Data = imageSrc.split(',')[1];
        return Buffer.from(base64Data, 'base64');
      }

      if (imageSrc.includes('s3.amazonaws.com') || imageSrc.includes('amazonaws.com')) {
        const key = this.extractS3KeyFromUrl(imageSrc);
        return await this.s3Service.downloadFile(key);
      }

      const response = await fetch(imageSrc);
      if (!response.ok) {
        throw new Error(`Failed to download user image: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      throw new Error(`Error downloading user image: ${error.message}`);
    }
  }

  /**
   * Aplica transformaciones y efectos a la imagen del usuario
   */
  private async applyTransformationsAndEffects(
    imageBuffer: Buffer,
    monthData: CalendarMonthData,
    customizationData: CalendarCustomizationData
  ): Promise<Buffer> {
    let image = sharp(imageBuffer);

    // 1. Aplicar escala
    const originalMetadata = await image.metadata();
    const scaledWidth = Math.round((originalMetadata.width || 0) * monthData.transformations.scale);
    const scaledHeight = Math.round((originalMetadata.height || 0) * monthData.transformations.scale);

    if (monthData.transformations.scale !== 1) {
      image = image.resize(scaledWidth, scaledHeight, {
        fit: 'fill',
        kernel: 'lanczos3'
      });
    }

    // 2. Aplicar rotación (si existe)
    if (monthData.transformations.rotation && monthData.transformations.rotation !== 0) {
      image = image.rotate(monthData.transformations.rotation, {
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });
    }

    // 3. Aplicar efectos de color
    const hasEffects =
      monthData.effects.brightness !== 0 ||
      monthData.effects.contrast !== 0 ||
      monthData.effects.saturation !== 0 ||
      monthData.effects.sepia !== 0;

    if (hasEffects) {
      const brightnessMultiplier = 1 + (monthData.effects.brightness / 100);
      const contrastMultiplier = 1 + (monthData.effects.contrast / 100);

      image = image.modulate({
        brightness: brightnessMultiplier,
        saturation: 1 + (monthData.effects.saturation / 100)
      });

      if (monthData.effects.contrast !== 0) {
        image = image.linear(contrastMultiplier, -(128 * contrastMultiplier) + 128);
      }

      if (monthData.effects.sepia > 0) {
        const sepiaAmount = monthData.effects.sepia / 100;
        image = image.recomb([
          [0.393 + 0.607 * (1 - sepiaAmount), 0.769 * sepiaAmount, 0.189 * sepiaAmount],
          [0.349 * sepiaAmount, 0.686 + 0.314 * (1 - sepiaAmount), 0.168 * sepiaAmount],
          [0.272 * sepiaAmount, 0.534 * sepiaAmount, 0.131 + 0.869 * (1 - sepiaAmount)]
        ]);
      }
    }

    // 4. Aplicar filtros
    if (monthData.selectedFilter && monthData.selectedFilter !== 'none') {
      image = await this.applyFilter(image, monthData.selectedFilter);
    }

    return await image.toBuffer();
  }

  /**
   * Aplica filtros predefinidos
   */
  private async applyFilter(image: Sharp, filter: string): Promise<Sharp> {
    switch (filter.toLowerCase()) {
      case 'grayscale':
      case 'greyscale':
        return image.grayscale();

      case 'sepia':
        return image.recomb([
          [0.393, 0.769, 0.189],
          [0.349, 0.686, 0.168],
          [0.272, 0.534, 0.131]
        ]);

      case 'vintage':
        return image
          .recomb([
            [0.6, 0.3, 0.1],
            [0.3, 0.6, 0.1],
            [0.2, 0.3, 0.5]
          ])
          .modulate({ brightness: 1.1, saturation: 0.8 });

      case 'warm':
        return image.modulate({
          brightness: 1.05,
          saturation: 1.1
        });

      case 'cool':
        return image.tint({ r: 230, g: 240, b: 255 });

      case 'high_contrast':
        return image.normalize().linear(1.3, -(128 * 1.3) + 128);

      default:
        return image;
    }
  }

  /**
   * Crea fondo difuminado a partir de la imagen del usuario
   */
  private async createBlurredBackground(
    imageBuffer: Buffer,
    width: number,
    height: number,
    customizationData: CalendarCustomizationData
  ): Promise<Buffer> {
    // Calcular altura del área de foto (normalmente 47% de la altura total)
    const photoAreaHeight = customizationData.photoArea?.height
      ? Math.round((customizationData.photoArea.height / customizationData.canvasHeight) * height)
      : Math.round(height * 0.47);

    // Redimensionar imagen para que cubra todo el ancho, luego aplicar blur
    const blurred = await sharp(imageBuffer)
      .resize(width, photoAreaHeight, {
        fit: 'cover',
        position: 'center',
        kernel: 'lanczos3'
      })
      .blur(20)  // Blur fuerte para fondo
      .toBuffer();

    // Crear canvas completo con fondo blanco en la parte inferior
    const canvas = sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    });

    // Componer: fondo blanco + imagen difuminada en la parte superior
    return await canvas
      .composite([
        {
          input: blurred,
          top: 0,
          left: 0,
          blend: 'over'
        }
      ])
      .png()
      .toBuffer();
  }

  /**
   * Combina fondo difuminado + imagen procesada + template
   */
  private async compositeCalendarWithTemplate(
    blurredBackground: Buffer,
    processedImage: Buffer,
    templateBuffer: Buffer,
    customizationData: CalendarCustomizationData,
    finalWidth: number,
    finalHeight: number
  ): Promise<Buffer> {
    // Calcular photoArea escalado
    const photoArea = customizationData.photoArea || {
      x: 0,
      y: 0,
      width: customizationData.canvasWidth,
      height: Math.round(customizationData.canvasHeight * 0.47)
    };

    const photoX = Math.round((photoArea.x / customizationData.canvasWidth) * finalWidth);
    const photoY = Math.round((photoArea.y / customizationData.canvasHeight) * finalHeight);
    const photoWidth = Math.round((photoArea.width / customizationData.canvasWidth) * finalWidth);
    const photoHeight = Math.round((photoArea.height / customizationData.canvasHeight) * finalHeight);

    // Redimensionar imagen del usuario al tamaño del photoArea
    const resizedUserImage = await sharp(processedImage)
      .resize(photoWidth, photoHeight, {
        fit: 'cover',
        position: 'center',
        kernel: 'lanczos3'
      })
      .toBuffer();

    // Redimensionar template al tamaño final
    const resizedTemplate = await sharp(templateBuffer)
      .resize(finalWidth, finalHeight, {
        fit: 'fill',
        kernel: 'lanczos3'
      })
      .toBuffer();

    // Componer en orden: fondo difuminado → imagen usuario → template
    const result = await sharp(blurredBackground)
      .composite([
        {
          input: resizedUserImage,
          top: photoY,
          left: photoX,
          blend: 'over'
        },
        {
          input: resizedTemplate,
          top: 0,
          left: 0,
          blend: 'over'
        }
      ])
      .png()
      .toBuffer();

    return result;
  }

  /**
   * Extrae el key de S3 desde una URL
   */
  private extractS3KeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const key = urlObj.pathname.substring(1);
      return key;
    } catch {
      return url.startsWith('/') ? url.substring(1) : url;
    }
  }

  /**
   * Valida los datos de customización
   */
  validateCustomizationData(data: any): data is CalendarCustomizationData {
    return (
      typeof data === 'object' &&
      typeof data.canvasWidth === 'number' &&
      typeof data.canvasHeight === 'number' &&
      typeof data.exportResolution === 'number' &&
      typeof data.monthTemplates === 'object' &&
      Array.isArray(data.months) &&
      data.months.length > 0
    );
  }
}
