import { EstadoPedidoDinamico } from '../entities/estado-pedido.entity';

export interface EstadoPedidoRepositoryPort {
  findById(id: number): Promise<EstadoPedidoDinamico | null>;
  findByNombre(nombre: string): Promise<EstadoPedidoDinamico | null>;
  findAll(soloActivos?: boolean): Promise<EstadoPedidoDinamico[]>;
  save(estado: EstadoPedidoDinamico): Promise<EstadoPedidoDinamico>;
  update(id: number, estado: Partial<EstadoPedidoDinamico>): Promise<EstadoPedidoDinamico>;
  delete(id: number): Promise<boolean>;
  countPedidosByEstadoId(estadoId: number): Promise<number>;
}
