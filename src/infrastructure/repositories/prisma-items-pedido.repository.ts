import prisma from '@infrastructure/database/prisma.client';
import { ItemPedido } from '../entities/item-pedido.entity';
import { ItemsPedidoRepositoryPort } from '../ports/items-pedido.repository.port';

export class PrismaItemsPedidoRepository implements ItemsPedidoRepositoryPort {
  async findById(id: number): Promise<ItemPedido | null> {
    const itemPedido = await prisma.items_pedido.findUnique({
      where: { id }
    });

    return itemPedido ? this.toDomain(itemPedido) : null;
  }

  async findByPedidoId(pedidoId: number): Promise<ItemPedido[]> {
    const itemsPedido = await prisma.items_pedido.findMany({
      where: { pedido_id: pedidoId }
    });

    return itemsPedido.map(item => this.toDomain(item));
  }

  async save(itemPedido: ItemPedido): Promise<ItemPedido> {
    const created = await prisma.items_pedido.create({
      data: this.toPrisma(itemPedido)
    });

    return this.toDomain(created);
  }

  async update(itemPedido: ItemPedido): Promise<ItemPedido> {
    if (!itemPedido.id) {
      throw new Error('El ID del item de pedido es requerido para actualizar');
    }

    const updated = await prisma.items_pedido.update({
      where: { id: itemPedido.id },
      data: this.toPrisma(itemPedido)
    });

    return this.toDomain(updated);
  }

  private toDomain(prismaItem: any): ItemPedido {
    return {
      id: prismaItem.id,
      pedido_id: prismaItem.pedido_id,
      tipo_item: prismaItem.tipo_item,
      paquete_predefinido_id: prismaItem.paquete_predefinido_id,
      cantidad_fotos: prismaItem.cantidad_fotos,
      precio_unitario: Number(prismaItem.precio_unitario),
      subtotal: Number(prismaItem.subtotal),
      cantidad: prismaItem.cantidad || 1,
      categoria_paquete: prismaItem.categoria_paquete,
      nombre_paquete: prismaItem.nombre_paquete,
      num_fotos_requeridas: prismaItem.num_fotos_requeridas,
      paquete_id: prismaItem.paquete_id
    };
  }

  private toPrisma(itemPedido: ItemPedido): any {
    return {
      pedido_id: itemPedido.pedido_id,
      tipo_item: itemPedido.tipo_item,
      paquete_predefinido_id: itemPedido.paquete_predefinido_id,
      cantidad_fotos: itemPedido.cantidad_fotos,
      precio_unitario: itemPedido.precio_unitario,
      subtotal: itemPedido.subtotal,
      cantidad: itemPedido.cantidad,
      categoria_paquete: itemPedido.categoria_paquete,
      nombre_paquete: itemPedido.nombre_paquete,
      num_fotos_requeridas: itemPedido.num_fotos_requeridas,
      paquete_id: itemPedido.paquete_id
    };
  }
}