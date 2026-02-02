import { CarritoTemporalRepositoryPort } from '@domain/ports/carrito-temporal.repository.port';
import { CarritoTemporalEntity, CarritoTemporalData } from '@domain/entities/carrito-temporal.entity';

interface GuardarCarritoTemporalResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class GuardarCarritoTemporalUseCase {
  constructor(
    private readonly carritoTemporalRepository: CarritoTemporalRepositoryPort
  ) {}

  async execute(usuarioId: number, datos: CarritoTemporalData): Promise<GuardarCarritoTemporalResult> {
    try {
      // 1. Validar usuarioId
      if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
        return {
          success: false,
          message: 'ID de usuario inválido',
          error: 'ID de usuario inválido'
        };
      }

      // 2. Validar estructura de datos
      if (!datos || !datos.items || !Array.isArray(datos.items)) {
        return {
          success: false,
          message: 'Datos de carrito inválidos',
          error: 'Datos de carrito inválidos'
        };
      }

      // 3. Verificar si ya existe un carrito
      const carritoExistente = await this.carritoTemporalRepository.findByUsuarioId(usuarioId);

      if (carritoExistente) {
        // Actualizar existente
        await this.carritoTemporalRepository.update(usuarioId, {
          ...datos,
          lastModified: Date.now()
        });
      } else {
        // Crear nuevo
        const nuevoCarrito = CarritoTemporalEntity.create(usuarioId, datos);
        await this.carritoTemporalRepository.save(nuevoCarrito);
      }

      return {
        success: true,
        message: 'Carrito guardado correctamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al guardar el carrito temporal',
        error: error.message
      };
    }
  }
}
