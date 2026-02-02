import { CarritoTemporalRepositoryPort } from '@domain/ports/carrito-temporal.repository.port';
import { CarritoTemporalData } from '@domain/entities/carrito-temporal.entity';

interface ObtenerCarritoTemporalResult {
  success: boolean;
  data?: CarritoTemporalData | null;
  message?: string;
  error?: string;
}

export class ObtenerCarritoTemporalUseCase {
  constructor(
    private readonly carritoTemporalRepository: CarritoTemporalRepositoryPort
  ) {}

  async execute(usuarioId: number): Promise<ObtenerCarritoTemporalResult> {
    try {
      if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
        return {
          success: false,
          message: 'ID de usuario inválido',
          error: 'ID de usuario inválido'
        };
      }

      const carrito = await this.carritoTemporalRepository.findByUsuarioId(usuarioId);

      return {
        success: true,
        data: carrito ? carrito.datos : null
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener el carrito temporal',
        error: error.message
      };
    }
  }
}
