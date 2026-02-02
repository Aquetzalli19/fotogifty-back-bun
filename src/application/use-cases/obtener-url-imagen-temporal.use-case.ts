import { ImagenTemporalRepositoryPort } from '@domain/ports/imagen-temporal.repository.port';
import { S3Service } from '@infrastructure/services/s3.service';

interface ObtenerUrlImagenTemporalResult {
  success: boolean;
  data?: {
    url: string;
    expiresIn: number;
  };
  message?: string;
  error?: string;
}

export class ObtenerUrlImagenTemporalUseCase {
  constructor(
    private readonly imagenTemporalRepository: ImagenTemporalRepositoryPort,
    private readonly s3Service: S3Service
  ) {}

  async execute(
    usuarioId: number,
    imagenId: number
  ): Promise<ObtenerUrlImagenTemporalResult> {
    try {
      // 1. Validaciones
      if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
        return {
          success: false,
          message: 'ID de usuario inválido',
          error: 'ID de usuario inválido'
        };
      }

      if (!imagenId || typeof imagenId !== 'number' || imagenId <= 0) {
        return {
          success: false,
          message: 'ID de imagen inválido',
          error: 'ID de imagen inválido'
        };
      }

      // 2. Buscar imagen
      const imagen = await this.imagenTemporalRepository.findById(imagenId);

      if (!imagen) {
        return {
          success: false,
          message: 'Imagen no encontrada',
          error: 'Imagen no encontrada'
        };
      }

      // 3. Verificar propiedad (SEGURIDAD CRÍTICA)
      if (imagen.usuario_id !== usuarioId) {
        return {
          success: false,
          message: 'Acceso denegado',
          error: 'Forbidden'
        };
      }

      // 4. Verificar expiración
      if (new Date() > imagen.expires_at) {
        return {
          success: false,
          message: 'La imagen ha expirado',
          error: 'Imagen expirada'
        };
      }

      // 5. Generar URL firmada
      const expiresIn = 3600;  // 1 hora
      const url = await this.s3Service.getDownloadUrl(imagen.s3_key, expiresIn);

      return {
        success: true,
        data: {
          url,
          expiresIn
        }
      };
    } catch (error: any) {
      console.error('Error al obtener URL de imagen temporal:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener la URL de la imagen',
        error: error.message
      };
    }
  }
}
