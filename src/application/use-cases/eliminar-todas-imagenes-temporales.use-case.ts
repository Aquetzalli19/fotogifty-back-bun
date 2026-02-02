import { ImagenTemporalRepositoryPort } from '@domain/ports/imagen-temporal.repository.port';

interface EliminarTodasImagenesTemporalesResult {
  success: boolean;
  deletedCount?: number;
  message?: string;
  error?: string;
}

export class EliminarTodasImagenesTemporalesUseCase {
  constructor(
    private readonly imagenTemporalRepository: ImagenTemporalRepositoryPort
  ) {}

  async execute(usuarioId: number): Promise<EliminarTodasImagenesTemporalesResult> {
    try {
      if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
        return {
          success: false,
          message: 'ID de usuario inválido',
          error: 'ID de usuario inválido'
        };
      }

      const deletedCount = await this.imagenTemporalRepository.deleteAllByUsuarioId(usuarioId);

      return {
        success: true,
        deletedCount,
        message: `${deletedCount} imágenes eliminadas correctamente`
      };
    } catch (error: any) {
      console.error('Error al eliminar todas las imágenes temporales:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar todas las imágenes temporales',
        error: error.message
      };
    }
  }
}
