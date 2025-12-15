import { PedidoEntity, EstadoPedido } from '../../domain/entities/pedido.entity';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';

interface ActualizarEstadoPedidoResult {
  success: boolean;
  data?: PedidoEntity;
  message?: string;
  error?: string;
}

export class ActualizarEstadoPedidoUseCase {
  constructor(private readonly pedidoRepository: PedidoRepositoryPort) {}

  async execute(
    id: number,
    nuevoEstado: EstadoPedido
  ): Promise<ActualizarEstadoPedidoResult> {
    try {
      // Validar que el estado sea uno de los valores permitidos
      const estadosValidos = Object.values(EstadoPedido);
      if (!estadosValidos.includes(nuevoEstado)) {
        return {
          success: false,
          message: `Estado no válido. Estados permitidos: ${estadosValidos.join(', ')}`,
          error: 'Estado no válido'
        };
      }

      // Verificar si el pedido existe
      const pedidoExistente = await this.pedidoRepository.findById(id);
      if (!pedidoExistente) {
        return {
          success: false,
          message: 'El pedido no existe',
          error: 'Pedido no encontrado'
        };
      }

      // Actualizar el estado del pedido
      const pedidoActualizado = await this.pedidoRepository.updateEstado(id, nuevoEstado);

      return {
        success: true,
        data: pedidoActualizado as PedidoEntity
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar el estado del pedido',
        error: error.message
      };
    }
  }
}