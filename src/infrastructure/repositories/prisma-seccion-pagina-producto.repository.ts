import prisma from '@infrastructure/database/prisma.client';
import {
  SeccionPaginaProducto,
  SeccionPaginaProductoEntity,
} from '@domain/entities/seccion-pagina-producto.entity';
import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';

export class PrismaSeccionPaginaProductoRepository
  implements SeccionPaginaProductoRepositoryPort
{
  async findByConfigId(configId: number): Promise<SeccionPaginaProducto[]> {
    const secciones = await prisma.secciones_pagina_producto.findMany({
      where: { config_id: configId },
      orderBy: { orden: 'asc' },
      include: {
        pestanas: { orderBy: { orden: 'asc' } },
        caracteristicas: { orderBy: { orden: 'asc' } },
      },
    });
    return secciones.map((s) => this.toDomain(s));
  }

  async findById(id: number): Promise<SeccionPaginaProducto | null> {
    const seccion = await prisma.secciones_pagina_producto.findUnique({
      where: { id },
    });
    return seccion ? this.toDomain(seccion) : null;
  }

  async save(seccion: SeccionPaginaProducto): Promise<SeccionPaginaProducto> {
    const created = await prisma.secciones_pagina_producto.create({
      data: this.toPrisma(seccion),
    });
    return this.toDomain(created);
  }

  async update(
    id: number,
    data: Partial<SeccionPaginaProducto>
  ): Promise<SeccionPaginaProducto | null> {
    try {
      const updateData: any = {};
      if (data.tipo !== undefined) updateData.tipo = data.tipo;
      if (data.titulo !== undefined) updateData.titulo = data.titulo;
      if (data.activo !== undefined) updateData.activo = data.activo;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.estilo !== undefined) updateData.estilo = data.estilo;
      if (data.configuracion !== undefined) updateData.configuracion = data.configuracion;

      const updated = await prisma.secciones_pagina_producto.update({
        where: { id },
        data: updateData,
      });
      return this.toDomain(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<void> {
    await prisma.secciones_pagina_producto.delete({ where: { id } });
  }

  async reorder(configId: number, sectionIds: number[]): Promise<void> {
    await prisma.$transaction(
      sectionIds.map((id, i) =>
        prisma.secciones_pagina_producto.update({
          where: { id },
          data: { orden: i },
        })
      )
    );
  }

  async getNextOrder(configId: number): Promise<number> {
    const result = await prisma.secciones_pagina_producto.aggregate({
      where: { config_id: configId },
      _max: { orden: true },
    });
    return (result._max.orden ?? -1) + 1;
  }

  async toggle(id: number): Promise<SeccionPaginaProducto | null> {
    const seccion = await prisma.secciones_pagina_producto.findUnique({
      where: { id },
    });
    if (!seccion) return null;

    const updated = await prisma.secciones_pagina_producto.update({
      where: { id },
      data: { activo: !seccion.activo },
    });
    return this.toDomain(updated);
  }

  private toDomain(prismaSeccion: any): SeccionPaginaProducto {
    return new SeccionPaginaProductoEntity(
      prismaSeccion.config_id,
      prismaSeccion.tipo,
      prismaSeccion.orden,
      prismaSeccion.activo,
      prismaSeccion.titulo,
      prismaSeccion.estilo as Record<string, any> | null,
      prismaSeccion.configuracion as Record<string, any> | null,
      prismaSeccion.id,
      prismaSeccion.created_at,
      prismaSeccion.updated_at,
      prismaSeccion.pestanas,
      prismaSeccion.caracteristicas
    );
  }

  private toPrisma(seccion: SeccionPaginaProducto): any {
    return {
      config_id: seccion.config_id,
      tipo: seccion.tipo,
      titulo: seccion.titulo ?? null,
      activo: seccion.activo,
      orden: seccion.orden,
      estilo: seccion.estilo ?? null,
      configuracion: seccion.configuracion ?? null,
    };
  }
}
