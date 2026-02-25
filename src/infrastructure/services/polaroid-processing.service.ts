import sharp, { Sharp } from 'sharp';
import { S3Service } from './s3.service';
import fetch from 'node-fetch';

export interface PolaroidData {
  imageSrc: string;  // data:image/jpeg;base64,... o URL
  transformations: {
    scale: number;
    rotation: number;
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
  copies: number;
}

export interface PolaroidCustomizationData {
  canvasWidth: number;
  canvasHeight: number;
  widthInches: number;
  heightInches: number;
  exportResolution: number;
  templateUrl: string;
  photoArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  polaroids: PolaroidData[];
}

export interface ProcessedPolaroidResult {
  buffer: Buffer;
  width: number;
  height: number;
  copies: number;
}

export class PolaroidProcessingService {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  /**
   * Procesa múltiples polaroids según la customización
   */
  async processCustomization(
    customizationData: PolaroidCustomizationData
  ): Promise<ProcessedPolaroidResult[]> {
    const results: ProcessedPolaroidResult[] = [];

    for (const polaroid of customizationData.polaroids) {
      const processed = await this.processSinglePolaroid(
        polaroid,
        customizationData
      );
      results.push(processed);
    }

    return results;
  }

  /**
   * Procesa un solo polaroid
   */
  async processSinglePolaroid(
    polaroid: PolaroidData,
    customizationData: PolaroidCustomizationData
  ): Promise<ProcessedPolaroidResult> {
    // 1. Descargar template
    const templateBuffer = await this.downloadTemplate(customizationData.templateUrl);

    // 2. Procesar imagen del usuario
    const userImageBuffer = await this.downloadUserImage(polaroid.imageSrc);
    const processedImage = await this.applyTransformationsAndEffects(
      userImageBuffer,
      polaroid,
      customizationData
    );

    // 3. Combinar imagen procesada con template
    const finalBuffer = await this.compositeImageWithTemplate(
      processedImage,
      templateBuffer,
      customizationData
    );

    // 4. Asegurar 300 DPI
    const finalProcessed = await sharp(finalBuffer)
      .withMetadata({
        density: 300,
        icc: 'srgb'
      })
      .toBuffer();

    const metadata = await sharp(finalProcessed).metadata();

    return {
      buffer: finalProcessed,
      width: metadata.width || customizationData.canvasWidth,
      height: metadata.height || customizationData.canvasHeight,
      copies: polaroid.copies
    };
  }

  /**
   * Descarga el template desde URL o S3
   */
  private async downloadTemplate(templateUrl: string): Promise<Buffer> {
    try {
      // Si es una URL de S3, extraer el key
      if (templateUrl.includes('s3.amazonaws.com') || templateUrl.includes('amazonaws.com')) {
        const key = this.extractS3KeyFromUrl(templateUrl);
        return await this.s3Service.downloadFile(key);
      }

      // Si es una ruta relativa o absoluta local (ej: /polaroid/Polaroid.png)
      if (templateUrl.startsWith('/')) {
        // Asumir que es una ruta de S3 sin el dominio
        const key = templateUrl.startsWith('/') ? templateUrl.substring(1) : templateUrl;
        return await this.s3Service.downloadFile(key);
      }

      // Si es una URL externa, descargar con fetch
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
      // Si es data URL (data:image/jpeg;base64,...)
      if (imageSrc.startsWith('data:')) {
        const base64Data = imageSrc.split(',')[1];
        return Buffer.from(base64Data, 'base64');
      }

      // Si es una URL de S3
      if (imageSrc.includes('s3.amazonaws.com') || imageSrc.includes('amazonaws.com')) {
        const key = this.extractS3KeyFromUrl(imageSrc);
        return await this.s3Service.downloadFile(key);
      }

      // URL externa
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
    polaroid: PolaroidData,
    customizationData: PolaroidCustomizationData
  ): Promise<Buffer> {
    let image = sharp(imageBuffer);

    // 1. Aplicar escala
    const originalMetadata = await image.metadata();
    const scaledWidth = Math.round((originalMetadata.width || 0) * polaroid.transformations.scale);
    const scaledHeight = Math.round((originalMetadata.height || 0) * polaroid.transformations.scale);

    if (polaroid.transformations.scale !== 1) {
      image = image.resize(scaledWidth, scaledHeight, {
        fit: 'fill',
        kernel: 'lanczos3'
      });
    }

    // 2. Aplicar rotación
    if (polaroid.transformations.rotation !== 0) {
      image = image.rotate(polaroid.transformations.rotation, {
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });
    }

    // 3. Aplicar efectos de color
    const hasEffects =
      polaroid.effects.brightness !== 0 ||
      polaroid.effects.contrast !== 0 ||
      polaroid.effects.saturation !== 0 ||
      polaroid.effects.sepia !== 0;

    if (hasEffects) {
      // Brightness: Sharp usa multiplicador (1.0 = normal, >1.0 más brillante, <1.0 más oscuro)
      // Frontend envía -100 a +100, convertir a 0.5-1.5
      const brightnessMultiplier = 1 + (polaroid.effects.brightness / 100);

      // Contrast: Sharp usa multiplicador (1.0 = normal)
      // Frontend envía -100 a +100, convertir a 0.5-1.5
      const contrastMultiplier = 1 + (polaroid.effects.contrast / 100);

      image = image.modulate({
        brightness: brightnessMultiplier,
        saturation: 1 + (polaroid.effects.saturation / 100)
      });

      // Aplicar contraste si es diferente de 0
      if (polaroid.effects.contrast !== 0) {
        image = image.linear(contrastMultiplier, -(128 * contrastMultiplier) + 128);
      }

      // Aplicar sepia si es mayor a 0
      if (polaroid.effects.sepia > 0) {
        const sepiaAmount = polaroid.effects.sepia / 100;
        image = image.recomb([
          [0.393 + 0.607 * (1 - sepiaAmount), 0.769 * sepiaAmount, 0.189 * sepiaAmount],
          [0.349 * sepiaAmount, 0.686 + 0.314 * (1 - sepiaAmount), 0.168 * sepiaAmount],
          [0.272 * sepiaAmount, 0.534 * sepiaAmount, 0.131 + 0.869 * (1 - sepiaAmount)]
        ]);
      }
    }

    // 4. Aplicar filtros
    if (polaroid.selectedFilter && polaroid.selectedFilter !== 'none') {
      image = await this.applyFilter(image, polaroid.selectedFilter);
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
        // Sepia completo
        return image.recomb([
          [0.393, 0.769, 0.189],
          [0.349, 0.686, 0.168],
          [0.272, 0.534, 0.131]
        ]);

      case 'vintage':
        // Vintage: sepia suave + contraste reducido
        return image
          .recomb([
            [0.6, 0.3, 0.1],
            [0.3, 0.6, 0.1],
            [0.2, 0.3, 0.5]
          ])
          .modulate({ brightness: 1.1, saturation: 0.8 });

      case 'warm':
        // Cálido: aumentar rojos y amarillos
        return image.modulate({
          brightness: 1.05,
          saturation: 1.1
        });

      case 'cool':
        // Frío: aumentar azules
        return image.tint({ r: 230, g: 240, b: 255 });

      case 'high_contrast':
        // Alto contraste
        return image.normalize().linear(1.3, -(128 * 1.3) + 128);

      default:
        return image;
    }
  }

  /**
   * Combina la imagen procesada con el template
   */
  private async compositeImageWithTemplate(
    processedImage: Buffer,
    templateBuffer: Buffer,
    customizationData: PolaroidCustomizationData
  ): Promise<Buffer> {
    const template = sharp(templateBuffer);
    const templateMeta = await template.metadata();

    // Dimensiones finales del canvas (a 300 DPI)
    const finalWidth = Math.round(customizationData.widthInches * customizationData.exportResolution);
    const finalHeight = Math.round(customizationData.heightInches * customizationData.exportResolution);

    // Redimensionar imagen del usuario para que quepa en el photoArea
    const photoAreaWidth = Math.round(customizationData.photoArea.width * (finalWidth / customizationData.canvasWidth));
    const photoAreaHeight = Math.round(customizationData.photoArea.height * (finalHeight / customizationData.canvasHeight));

    const resizedUserImage = await sharp(processedImage)
      .resize(photoAreaWidth, photoAreaHeight, {
        fit: 'cover',
        position: 'center',
        kernel: 'lanczos3'
      })
      .toBuffer();

    // Calcular posición del photoArea en el canvas final
    const photoX = Math.round(customizationData.photoArea.x * (finalWidth / customizationData.canvasWidth));
    const photoY = Math.round(customizationData.photoArea.y * (finalHeight / customizationData.canvasHeight));

    // Redimensionar template al tamaño final
    const resizedTemplate = await sharp(templateBuffer)
      .resize(finalWidth, finalHeight, {
        fit: 'fill',
        kernel: 'lanczos3'
      })
      .toBuffer();

    // Crear un canvas transparente del tamaño final
    const canvas = sharp({
      create: {
        width: finalWidth,
        height: finalHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      }
    });

    // Componer: primero la imagen del usuario, luego el template encima
    const result = await canvas
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
      // Remover el slash inicial
      const key = urlObj.pathname.substring(1);
      return key;
    } catch {
      // Si falla el parsing, asumir que ya es un key
      return url.startsWith('/') ? url.substring(1) : url;
    }
  }

  /**
   * Valida los datos de customización
   */
  validateCustomizationData(data: any): data is PolaroidCustomizationData {
    return (
      typeof data === 'object' &&
      typeof data.canvasWidth === 'number' &&
      typeof data.canvasHeight === 'number' &&
      typeof data.exportResolution === 'number' &&
      typeof data.templateUrl === 'string' &&
      typeof data.photoArea === 'object' &&
      Array.isArray(data.polaroids) &&
      data.polaroids.length > 0
    );
  }
}
