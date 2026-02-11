import prisma from '../database/prisma.client';
import { EstadoPedidoDinamico } from '../../domain/entities/estado-pedido.entity';
import { EstadoPedidoRepositoryPort } from '../../domain/ports/estado-pedido.repository.port';

export class PrismaEstadoPedidoRepository implements EstadoPedidoRepositoryPort {
  async findById(id: number): Promise<EstadoPedidoDinamico | null> {
    const estado = await prisma.estados_pedido.findUnique({
      where: { id }
    });
    return estado ? this.toDomain(estado) : null;
  }

  async findByNombre(nombre: string): Promise<EstadoPedidoDinamico | null> {
    const estado = await prisma.estados_pedido.findUnique({
      where: { nombre }
    });
    return estado ? this.toDomain(estado) : null;
  }

  async findAll(soloActivos: boolean = true): Promise<EstadoPedidoDinamico[]> {
    const estados = await prisma.estados_pedido.findMany({
      where: soloActivos ? { activo: true } : undefined,
      orderBy: { orden: 'asc' }
    });
    return estados.map(e => this.toDomain(e));
  }

  async save(estado: EstadoPedidoDinamico): Promise<EstadoPedidoDinamico> {
    const created = await prisma.estados_pedido.create({
      data: this.toPrisma(estado)
    });
    return this.toDomain(created);
  }

  async update(id: number, estado: Partial<EstadoPedidoDinamico>): Promise<EstadoPedidoDinamico> {
    const updated = await prisma.estados_pedido.update({
      where: { id },
      data: {
        ...(estado.nombre !== undefined && { nombre: estado.nombre }),
        ...(estado.descripcion !== undefined && { descripcion: estado.descripcion }),
        ...(estado.color !== undefined && { color: estado.color }),
        ...(estado.orden !== undefined && { orden: estado.orden }),
        ...(estado.activo !== undefined && { activo: estado.activo }),
      }
    });
    return this.toDomain(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.estados_pedido.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async countPedidosByEstadoId(estadoId: number): Promise<number> {
    return prisma.pedidos.count({
      where: { estado_id: estadoId }
    });
  }

  private toDomain(prismaEstado: any): EstadoPedidoDinamico {
    return {
      id: prismaEstado.id,
      nombre: prismaEstado.nombre,
      descripcion: prismaEstado.descripcion,
      color: prismaEstado.color,
      orden: prismaEstado.orden,
      activo: prismaEstado.activo,
    };
  }

  private toPrisma(estado: EstadoPedidoDinamico) {
    return {
      nombre: estado.nombre,
      descripcion: estado.descripcion || null,
      color: estado.color || null,
      orden: estado.orden,
      activo: estado.activo,
    };
  }
}
