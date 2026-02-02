import { ImagenTemporalRepositoryPort } from '@domain/ports/imagen-temporal.repository.port';
import { ImagenTemporalEntity } from '@domain/entities/imagen-temporal.entity';
import { S3Service } from '@infrastructure/services/s3.service';
import { v4 as uuidv4 } from 'uuid';

interface SubirImagenTemporalResult {
  success: boolean;
  data?: {
    id: number;
    s3Key: string;
    url: string;
  };
  message?: string;
  error?: string;
}

export class SubirImagenTemporalUseCase {
  constructor(
    private readonly imagenTemporalRepository: ImagenTemporalRepositoryPort,
    private readonly s3Service: S3Service
  ) {}

  async execute(
    usuarioId: number,
    file: Express.Multer.File
  ): Promise<SubirImagenTemporalResult> {
    try {
      // 1. Validaciones
      if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
        return {
          success: false,
          message: 'ID de usuario inválido',
          error: 'ID de usuario inválido'
        };
      }

      if (!file) {
        return {
          success: false,
          message: 'No se proporcionó ningún archivo',
          error: 'Archivo faltante'
        };
      }

      // 2. Generar nombre único para S3
      const extension = file.originalname.split('.').pop() || 'jpg';
      const filename = `${uuidv4()}.${extension}`;
      const s3Key = `temp/${usuarioId}/${filename}`;

      // 3. Subir a S3
      const url = await this.s3Service.uploadFile(file, s3Key);

      // 4. Guardar registro en DB
      const nuevaImagen = ImagenTemporalEntity.create(
        usuarioId,
        s3Key,
        file.originalname,
        file.mimetype,
        file.size,
        7  // Expira en 7 días
      );

      const imagenGuardada = await this.imagenTemporalRepository.save(nuevaImagen);

      return {
        success: true,
        data: {
          id: imagenGuardada.id!,
          s3Key: s3Key,
          url: url
        },
        message: 'Imagen subida correctamente'
      };
    } catch (error: any) {
      console.error('Error al subir imagen temporal:', error);
      return {
        success: false,
        message: error.message || 'Error al subir la imagen temporal',
        error: error.message
      };
    }
  }
}
