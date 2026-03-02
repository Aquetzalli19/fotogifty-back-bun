import prisma from '@infrastructure/database/prisma.client';
import { Caracteristica, CaracteristicaEntity } from '@domain/entities/caracteristica.entity';
import { CaracteristicaRepositoryPort } from '@domain/ports/caracteristica.repository.port';

export class PrismaCaracteristicaRepository implements CaracteristicaRepositoryPort {
  async findBySeccionId(seccionId: number): Promise<Caracteristica[]> {
    const items = await prisma.caracteristicas.findMany({
      where: { seccion_id: seccionId },
      orderBy: { orden: 'asc' },
    });
    return items.map((c) => this.toDomain(c));
  }

  async findById(id: number): Promise<Caracteristica | null> {
    const item = await prisma.caracteristicas.findUnique({ where: { id } });
    return item ? this.toDomain(item) : null;
  }

  async save(c: Caracteristica): Promise<Caracteristica> {
    const created = await prisma.caracteristicas.create({
      data: this.toPrisma(c),
    });
    return this.toDomain(created);
  }

  async update(id: number, data: Partial<Caracteristica>): Promise<Caracteristica | null> {
    try {
      const updateData: any = {};
      if (data.titulo !== undefined) updateData.titulo = data.titulo;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.icono !== undefined) updateData.icono = data.icono;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;

      const updated = await prisma.caracteristicas.update({
        where: { id },
        data: updateData,
      });
      return this.toDomain(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<void> {
    await prisma.caracteristicas.delete({ where: { id } });
  }

  async reorder(seccionId: number, ids: number[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, i) =>
        prisma.caracteristicas.update({
          where: { id },
          data: { orden: i },
        })
      )
    );
  }

  async getNextOrder(seccionId: number): Promise<number> {
    const result = await prisma.caracteristicas.aggregate({
      where: { seccion_id: seccionId },
      _max: { orden: true },
    });
    return (result._max.orden ?? -1) + 1;
  }

  private toDomain(prismaC: any): Caracteristica {
    return new CaracteristicaEntity(
      prismaC.seccion_id,
      prismaC.titulo,
      prismaC.descripcion,
      prismaC.icono,
      prismaC.orden,
      prismaC.activo,
      prismaC.id
    );
  }

  private toPrisma(c: Caracteristica): any {
    return {
      seccion_id: c.seccion_id,
      titulo: c.titulo,
      descripcion: c.descripcion,
      icono: c.icono,
      orden: c.orden,
      activo: c.activo,
    };
  }
}
