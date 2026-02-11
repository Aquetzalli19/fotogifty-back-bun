import { EstadoPedidoDinamico } from '../../domain/entities/estado-pedido.entity';
import { EstadoPedidoRepositoryPort } from '../../domain/ports/estado-pedido.repository.port';

interface ActualizarEstadoPedidoDinamicoResult {
  success: boolean;
  data?: EstadoPedidoDinamico;
  message?: string;
  error?: string;
}

export class ActualizarEstadoPedidoDinamicoUseCase {
  constructor(private readonly estadoPedidoRepository: EstadoPedidoRepositoryPort) {}

  async execute(
    id: number,
    datos: Partial<Pick<EstadoPedidoDinamico, 'nombre' | 'descripcion' | 'color' | 'orden' | 'activo'>>
  ): Promise<ActualizarEstadoPedidoDinamicoResult> {
    try {
      const existente = await this.estadoPedidoRepository.findById(id);
      if (!existente) {
        return {
          success: false,
          message: 'Estado de pedido no encontrado',
          error: 'No encontrado'
        };
      }

      if (datos.nombre !== undefined) {
        if (datos.nombre.trim().length === 0) {
          return {
            success: false,
            message: 'El nombre del estado no puede estar vacío',
            error: 'Nombre vacío'
          };
        }

        const duplicado = await this.estadoPedidoRepository.findByNombre(datos.nombre.trim());
        if (duplicado && duplicado.id !== id) {
          return {
            success: false,
            message: `Ya existe un estado con el nombre "${datos.nombre}"`,
            error: 'Nombre duplicado'
          };
        }

        datos.nombre = datos.nombre.trim();
      }

      const actualizado = await this.estadoPedidoRepository.update(id, datos);

      return {
        success: true,
        data: actualizado
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar el estado de pedido',
        error: error.message
      };
    }
  }
}
