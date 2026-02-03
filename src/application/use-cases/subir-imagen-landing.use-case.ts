import { S3Service } from '@infrastructure/services/s3.service';
import { v4 as uuidv4 } from 'uuid';

interface SubirImagenLandingResult {
  success: boolean;
  data?: { url: string };
  message?: string;
  error?: string;
}

export class SubirImagenLandingUseCase {
  constructor(private readonly s3Service: S3Service) {}

  async execute(
    file: Express.Multer.File,
    section_key: string,
    image_type: 'main' | 'background' | 'slide'
  ): Promise<SubirImagenLandingResult> {
    try {
      // Validaciones
      if (!file) {
        return {
          success: false,
          message: 'No se proporcionó ningún archivo',
          error: 'MISSING_FILE'
        };
      }

      if (!section_key) {
        return {
          success: false,
          message: 'Se requiere section_key',
          error: 'MISSING_SECTION_KEY'
        };
      }

      if (!image_type || !['main', 'background', 'slide'].includes(image_type)) {
        return {
          success: false,
          message: 'image_type debe ser "main", "background" o "slide"',
          error: 'INVALID_IMAGE_TYPE'
        };
      }

      // Validar que sea una imagen
      if (!file.mimetype.startsWith('image/')) {
        return {
          success: false,
          message: 'El archivo debe ser una imagen',
          error: 'INVALID_FILE_TYPE'
        };
      }

      // Generar key única para S3
      const extension = file.originalname.split('.').pop() || 'jpg';
      const uniqueId = uuidv4();
      const s3Key = `landing/${section_key}/${image_type}/${uniqueId}.${extension}`;

      // Subir a S3
      const url = await this.s3Service.uploadFile(file, s3Key);

      return {
        success: true,
        data: { url },
        message: 'Imagen subida exitosamente'
      };
    } catch (error: any) {
      console.error('Error en SubirImagenLandingUseCase:', error);
      return {
        success: false,
        message: 'Error al subir la imagen',
        error: error.message
      };
    }
  }
}
