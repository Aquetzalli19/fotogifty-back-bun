import { Pedido } from '../entities/pedido.entity';

export interface PedidoRepositoryPort {
  findById(id: number): Promise<Pedido | null>;
  findByUsuarioId(usuarioId: number): Promise<Pedido[]>;
  findByEstado(estado: string): Promise<Pedido[]>;
  findAll(): Promise<Pedido[]>;
  create(pedido: Pedido): Promise<Pedido>;
  update(pedido: Pedido): Promise<Pedido>;
  updateEstado(id: number, estado: string): Promise<Pedido | null>;
  delete(id: number): Promise<boolean>;
}