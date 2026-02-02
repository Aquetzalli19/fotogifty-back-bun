import prisma from '@infrastructure/database/prisma.client';
import { CarritoTemporal, CarritoTemporalEntity, CarritoTemporalData } from '@domain/entities/carrito-temporal.entity';
import { CarritoTemporalRepositoryPort } from '@domain/ports/carrito-temporal.repository.port';

export class PrismaCarritoTemporalRepository implements CarritoTemporalRepositoryPort {
  async findByUsuarioId(usuarioId: number): Promise<CarritoTemporal | null> {
    const carrito = await prisma.carritos_temporales.findUnique({
      where: { usuario_id: usuarioId }
    });

    return carrito ? this.toDomain(carrito) : null;
  }

  async save(carrito: CarritoTemporal): Promise<CarritoTemporal> {
    // Intentar actualizar si existe, crear si no
    const existing = await prisma.carritos_temporales.findUnique({
      where: { usuario_id: carrito.usuario_id }
    });

    if (existing) {
      const updated = await prisma.carritos_temporales.update({
        where: { usuario_id: carrito.usuario_id },
        data: this.toPrisma(carrito)
      });
      return this.toDomain(updated);
    } else {
      const created = await prisma.carritos_temporales.create({
        data: {
          usuario_id: carrito.usuario_id,
          ...this.toPrisma(carrito)
        }
      });
      return this.toDomain(created);
    }
  }

  async update(usuarioId: number, datos: CarritoTemporalData): Promise<CarritoTemporal | null> {
    try {
      const updated = await prisma.carritos_temporales.update({
        where: { usuario_id: usuarioId },
        data: {
          datos: datos as any,  // Prisma maneja el JSON
          updated_at: new Date()
        }
      });
      return this.toDomain(updated);
    } catch (error) {
      console.error('Error updating carrito temporal:', error);
      return null;
    }
  }

  async delete(usuarioId: number): Promise<boolean> {
    try {
      await prisma.carritos_temporales.delete({
        where: { usuario_id: usuarioId }
      });
      return true;
    } catch (error) {
      console.error('Error deleting carrito temporal:', error);
      return false;
    }
  }

  async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.carritos_temporales.deleteMany({
      where: {
        updated_at: {
          lt: cutoffDate
        }
      }
    });

    return result.count;
  }

  private toDomain(prismaCarrito: any): CarritoTemporal {
    return new CarritoTemporalEntity(
      prismaCarrito.usuario_id,
      prismaCarrito.datos,
      prismaCarrito.id,
      prismaCarrito.created_at,
      prismaCarrito.updated_at
    );
  }

  private toPrisma(carrito: CarritoTemporal): any {
    return {
      datos: carrito.datos as any  // Prisma maneja el JSON automáticamente
    };
  }
}
