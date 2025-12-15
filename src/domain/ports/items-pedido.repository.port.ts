import { ItemPedido } from '../entities/item-pedido.entity';

export interface ItemsPedidoRepositoryPort {
  findById(id: number): Promise<ItemPedido | null>;
  findByPedidoId(pedidoId: number): Promise<ItemPedido[]>;
  save(itemPedido: ItemPedido): Promise<ItemPedido>;
  update(itemPedido: ItemPedido): Promise<ItemPedido>;
}