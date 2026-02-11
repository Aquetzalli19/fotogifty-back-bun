import { PedidoEntity } from '../../domain/entities/pedido.entity';
import { PedidoRepositoryPort } from '../../domain/ports/pedido.repository.port';
import { EstadoPedidoRepositoryPort } from '../../domain/ports/estado-pedido.repository.port';

interface ActualizarEstadoPedidoResult {
  success: boolean;
  data?: PedidoEntity;
  message?: string;
  error?: string;
}

export class ActualizarEstadoPedidoUseCase {
  constructor(
    private readonly pedidoRepository: PedidoRepositoryPort,
    private readonly estadoPedidoRepository: EstadoPedidoRepositoryPort
  ) {}

  async execute(
    id: number,
    nuevoEstado: string
  ): Promise<ActualizarEstadoPedidoResult> {
    try {
      // Validar que el estado exista en la BD
      const estadoValido = await this.estadoPedidoRepository.findByNombre(nuevoEstado);
      if (!estadoValido) {
        const estados = await this.estadoPedidoRepository.findAll(true);
        const nombresValidos = estados.map(e => e.nombre).join(', ');
        return {
          success: false,
          message: `Estado no válido. Estados permitidos: ${nombresValidos}`,
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
