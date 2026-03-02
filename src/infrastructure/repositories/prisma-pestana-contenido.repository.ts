import prisma from '@infrastructure/database/prisma.client';
import {
  PestanaContenido,
  PestanaContenidoEntity,
} from '@domain/entities/pestana-contenido.entity';
import { PestanaContenidoRepositoryPort } from '@domain/ports/pestana-contenido.repository.port';

export class PrismaPestanaContenidoRepository implements PestanaContenidoRepositoryPort {
  async findBySeccionId(seccionId: number): Promise<PestanaContenido[]> {
    const pestanas = await prisma.pestanas_contenido.findMany({
      where: { seccion_id: seccionId },
      orderBy: { orden: 'asc' },
    });
    return pestanas.map((p) => this.toDomain(p));
  }

  async findById(id: number): Promise<PestanaContenido | null> {
    const pestana = await prisma.pestanas_contenido.findUnique({ where: { id } });
    return pestana ? this.toDomain(pestana) : null;
  }

  async save(pestana: PestanaContenido): Promise<PestanaContenido> {
    const created = await prisma.pestanas_contenido.create({
      data: this.toPrisma(pestana),
    });
    return this.toDomain(created);
  }

  async update(id: number, data: Partial<PestanaContenido>): Promise<PestanaContenido | null> {
    try {
      const updateData: any = {};
      if (data.titulo !== undefined) updateData.titulo = data.titulo;
      if (data.contenido !== undefined) updateData.contenido = data.contenido;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;
      if (data.usar_datos_producto !== undefined) updateData.usar_datos_producto = data.usar_datos_producto;
      if (data.campo_datos_producto !== undefined) updateData.campo_datos_producto = data.campo_datos_producto;

      const updated = await prisma.pestanas_contenido.update({
        where: { id },
        data: updateData,
      });
      return this.toDomain(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<void> {
    await prisma.pestanas_contenido.delete({ where: { id } });
  }

  async reorder(seccionId: number, ids: number[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, i) =>
        prisma.pestanas_contenido.update({
          where: { id },
          data: { orden: i },
        })
      )
    );
  }

  async getNextOrder(seccionId: number): Promise<number> {
    const result = await prisma.pestanas_contenido.aggregate({
      where: { seccion_id: seccionId },
      _max: { orden: true },
    });
    return (result._max.orden ?? -1) + 1;
  }

  private toDomain(prismaPestana: any): PestanaContenido {
    return new PestanaContenidoEntity(
      prismaPestana.seccion_id,
      prismaPestana.titulo,
      prismaPestana.contenido,
      prismaPestana.orden,
      prismaPestana.activo,
      prismaPestana.usar_datos_producto,
      prismaPestana.campo_datos_producto,
      prismaPestana.id
    );
  }

  private toPrisma(pestana: PestanaContenido): any {
    return {
      seccion_id: pestana.seccion_id,
      titulo: pestana.titulo,
      contenido: pestana.contenido,
      orden: pestana.orden,
      activo: pestana.activo,
      usar_datos_producto: pestana.usar_datos_producto,
      campo_datos_producto: pestana.campo_datos_producto ?? null,
    };
  }
}
