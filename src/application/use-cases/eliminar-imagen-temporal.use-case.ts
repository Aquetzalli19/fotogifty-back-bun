import { ImagenTemporalRepositoryPort } from '@domain/ports/imagen-temporal.repository.port';

interface EliminarImagenTemporalResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class EliminarImagenTemporalUseCase {
  constructor(
    private readonly imagenTemporalRepository: ImagenTemporalRepositoryPort
  ) {}

  async execute(
    usuarioId: number,
    imagenId: number
  ): Promise<EliminarImagenTemporalResult> {
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

      // 4. Eliminar de DB (el archivo en S3 se limpiará automáticamente por lifecycle policy)
      const deleted = await this.imagenTemporalRepository.delete(imagenId);

      if (!deleted) {
        return {
          success: false,
          message: 'No se pudo eliminar la imagen',
          error: 'Error al eliminar'
        };
      }

      return {
        success: true,
        message: 'Imagen eliminada correctamente'
      };
    } catch (error: any) {
      console.error('Error al eliminar imagen temporal:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar la imagen temporal',
        error: error.message
      };
    }
  }
}
