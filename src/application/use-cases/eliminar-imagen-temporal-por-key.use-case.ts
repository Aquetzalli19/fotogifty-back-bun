import { ImagenTemporalRepositoryPort } from '@domain/ports/imagen-temporal.repository.port';
import { S3Service } from '@infrastructure/services/s3.service';

interface EliminarImagenTemporalPorKeyResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class EliminarImagenTemporalPorKeyUseCase {
  constructor(
    private readonly imagenTemporalRepository: ImagenTemporalRepositoryPort,
    private readonly s3Service: S3Service
  ) {}

  async execute(
    usuarioId: number,
    s3Key: string
  ): Promise<EliminarImagenTemporalPorKeyResult> {
    try {
      // 1. Validar ownership sin consulta a DB: la key debe empezar con temp/{userId}/
      const expectedPrefix = `temp/${usuarioId}/`;
      if (!s3Key || !s3Key.startsWith(expectedPrefix)) {
        return {
          success: false,
          message: 'Acceso denegado: la clave no pertenece a este usuario',
          error: 'UNAUTHORIZED_KEY'
        };
      }

      // 2. Eliminar objeto de S3 (idempotente — no lanza error si no existe)
      await this.s3Service.deleteObject(s3Key);

      // 3. Intentar eliminar registro de DB (puede no existir si el upload nunca completó)
      const imagen = await this.imagenTemporalRepository.findByS3Key(s3Key);
      if (imagen && imagen.id) {
        await this.imagenTemporalRepository.delete(imagen.id);
      }

      return {
        success: true,
        message: 'Imagen eliminada correctamente'
      };
    } catch (error: any) {
      console.error('Error al eliminar imagen temporal por key:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar la imagen',
        error: error.message
      };
    }
  }
}
