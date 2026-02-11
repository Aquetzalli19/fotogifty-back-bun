import { EstadoPedidoDinamico, EstadoPedidoEntity } from '../../domain/entities/estado-pedido.entity';
import { EstadoPedidoRepositoryPort } from '../../domain/ports/estado-pedido.repository.port';

interface CrearEstadoPedidoResult {
  success: boolean;
  data?: EstadoPedidoDinamico;
  message?: string;
  error?: string;
}

export class CrearEstadoPedidoUseCase {
  constructor(private readonly estadoPedidoRepository: EstadoPedidoRepositoryPort) {}

  async execute(
    nombre: string,
    orden: number = 0,
    descripcion?: string,
    color?: string
  ): Promise<CrearEstadoPedidoResult> {
    try {
      if (!nombre || nombre.trim().length === 0) {
        return {
          success: false,
          message: 'El nombre del estado es requerido',
          error: 'Nombre vacío'
        };
      }

      const existente = await this.estadoPedidoRepository.findByNombre(nombre.trim());
      if (existente) {
        return {
          success: false,
          message: `Ya existe un estado con el nombre "${nombre}"`,
          error: 'Nombre duplicado'
        };
      }

      const nuevoEstado = EstadoPedidoEntity.create(nombre.trim(), orden, descripcion, color);
      const creado = await this.estadoPedidoRepository.save(nuevoEstado);

      return {
        success: true,
        data: creado
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear el estado de pedido',
        error: error.message
      };
    }
  }
}
