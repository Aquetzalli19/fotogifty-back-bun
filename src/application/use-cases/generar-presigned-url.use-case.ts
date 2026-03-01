import { ImagenTemporalRepositoryPort } from '@domain/ports/imagen-temporal.repository.port';
import { ImagenTemporalEntity } from '@domain/entities/imagen-temporal.entity';
import { S3Service } from '@infrastructure/services/s3.service';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_SIZE_BYTES = 25_000_000; // 25 MB

interface GenerarPresignedUrlResult {
  success: boolean;
  data?: {
    uploadUrl: string;
    s3Key: string;
    publicUrl: string;
    expiresAt: Date;
  };
  message?: string;
  error?: string;
}

export class GenerarPresignedUrlUseCase {
  constructor(
    private readonly imagenTemporalRepository: ImagenTemporalRepositoryPort,
    private readonly s3Service: S3Service
  ) {}

  async execute(
    usuarioId: number,
    filename: string,
    contentType: string,
    sizeBytes: number
  ): Promise<GenerarPresignedUrlResult> {
    try {
      // 1. Validar content type
      if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
        return {
          success: false,
          message: `Tipo de contenido no permitido. Permitidos: ${ALLOWED_CONTENT_TYPES.join(', ')}`,
          error: 'CONTENT_TYPE_NOT_ALLOWED'
        };
      }

      // 2. Validar tamaño
      if (!sizeBytes || sizeBytes < 1 || sizeBytes > MAX_SIZE_BYTES) {
        return {
          success: false,
          message: `El tamaño del archivo debe estar entre 1 byte y ${MAX_SIZE_BYTES / 1_000_000} MB`,
          error: 'SIZE_EXCEEDED'
        };
      }

      // 3. Extraer extensión del filename
      const parts = (filename || '').split('.');
      const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg';

      // 4. Generar s3Key único
      const s3Key = `temp/${usuarioId}/${Date.now()}-${uuidv4()}.${ext}`;

      // 5. Generar presigned PUT URL (expira en 1 hora)
      const uploadUrl = await this.s3Service.generatePresignedPutUrl(s3Key, contentType, 3600);

      // 6. Construir public URL
      const bucket = process.env.S3_BUCKET_NAME!;
      const region = process.env.AWS_REGION || 'us-east-1';
      const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

      // 7. expires_at requerido por DB — se pone en 10 años (efectivamente permanente)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 10);

      // 8. Crear registro en DB con la public URL ya conocida
      const nuevaImagen = new ImagenTemporalEntity(
        usuarioId,
        s3Key,
        filename,
        contentType,
        sizeBytes,
        expiresAt,
        publicUrl
      );
      await this.imagenTemporalRepository.save(nuevaImagen);

      return {
        success: true,
        data: { uploadUrl, s3Key, publicUrl, expiresAt }
      };
    } catch (error: any) {
      console.error('Error al generar presigned URL:', error);
      return {
        success: false,
        message: error.message || 'Error al generar la URL de subida',
        error: error.message
      };
    }
  }
}
