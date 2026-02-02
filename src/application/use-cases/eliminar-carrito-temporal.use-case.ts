import { CarritoTemporalRepositoryPort } from '@domain/ports/carrito-temporal.repository.port';

interface EliminarCarritoTemporalResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class EliminarCarritoTemporalUseCase {
  constructor(
    private readonly carritoTemporalRepository: CarritoTemporalRepositoryPort
  ) {}

  async execute(usuarioId: number): Promise<EliminarCarritoTemporalResult> {
    try {
      if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
        return {
          success: false,
          message: 'ID de usuario inválido',
          error: 'ID de usuario inválido'
        };
      }

      const deleted = await this.carritoTemporalRepository.delete(usuarioId);

      if (!deleted) {
        return {
          success: false,
          message: 'No se pudo eliminar el carrito o no existe',
          error: 'Error al eliminar'
        };
      }

      return {
        success: true,
        message: 'Carrito eliminado correctamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar el carrito temporal',
        error: error.message
      };
    }
  }
}
