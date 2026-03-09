import { S3Service } from '@infrastructure/services/s3.service';
import { v4 as uuidv4 } from 'uuid';

interface Result {
  success: boolean;
  data?: { url: string };
  message?: string;
  error?: string;
}

export class SubirImagenProductPageUseCase {
  constructor(private readonly s3Service: S3Service) {}

  async execute(
    file: Express.Multer.File,
    section_key: string,
    image_type: 'main' | 'slide'
  ): Promise<Result> {
    try {
      if (!file) {
        return { success: false, message: 'No se proporcionó ningún archivo', error: 'MISSING_FILE' };
      }

      if (!section_key) {
        return { success: false, message: 'Se requiere section_key', error: 'MISSING_SECTION_KEY' };
      }

      if (!image_type || !['main', 'slide'].includes(image_type)) {
        return { success: false, message: 'image_type debe ser "main" o "slide"', error: 'INVALID_IMAGE_TYPE' };
      }

      if (!file.mimetype.startsWith('image/')) {
        return { success: false, message: 'El archivo debe ser una imagen', error: 'INVALID_FILE_TYPE' };
      }

      const extension = file.originalname.split('.').pop() || 'jpg';
      const uniqueId = uuidv4();
      const s3Key = `product-page/${section_key}/${image_type}/${uniqueId}.${extension}`;

      const url = await this.s3Service.uploadFile(file, s3Key);

      return { success: true, data: { url }, message: 'Imagen subida exitosamente' };
    } catch (error: any) {
      console.error('Error en SubirImagenProductPageUseCase:', error);
      return { success: false, message: 'Error al subir la imagen', error: error.message };
    }
  }
}
