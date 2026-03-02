import prisma from '@infrastructure/database/prisma.client';
import {
  ConfiguracionPaginaProducto,
  ConfiguracionPaginaProductoEntity,
} from '@domain/entities/configuracion-pagina-producto.entity';
import { ConfiguracionPaginaProductoRepositoryPort } from '@domain/ports/configuracion-pagina-producto.repository.port';

const FULL_INCLUDE = {
  secciones: {
    orderBy: { orden: 'asc' as const },
    include: {
      pestanas: { orderBy: { orden: 'asc' as const } },
      caracteristicas: { orderBy: { orden: 'asc' as const } },
    },
  },
};

export class PrismaConfiguracionPaginaProductoRepository
  implements ConfiguracionPaginaProductoRepositoryPort
{
  async findAll(): Promise<ConfiguracionPaginaProducto[]> {
    const configs = await prisma.configuracion_pagina_producto.findMany({
      include: {
        secciones: { orderBy: { orden: 'asc' } },
      },
      orderBy: { id: 'asc' },
    });
    return configs.map((c) => this.toDomain(c));
  }

  async findById(id: number): Promise<ConfiguracionPaginaProducto | null> {
    const config = await prisma.configuracion_pagina_producto.findUnique({
      where: { id },
    });
    return config ? this.toDomain(config) : null;
  }

  async findByIdWithFullData(id: number): Promise<ConfiguracionPaginaProducto | null> {
    const config = await prisma.configuracion_pagina_producto.findUnique({
      where: { id },
      include: FULL_INCLUDE,
    });
    return config ? this.toDomain(config) : null;
  }

  async resolveConfig(
    producto_id?: number,
    categoria_id?: number
  ): Promise<ConfiguracionPaginaProducto | null> {
    // 1. Most specific: product-level
    if (producto_id) {
      const byProduct = await prisma.configuracion_pagina_producto.findFirst({
        where: { alcance: 'producto', producto_id, activo: true },
        include: FULL_INCLUDE,
      });
      if (byProduct) return this.toDomain(byProduct);
    }

    // 2. Category-level
    if (categoria_id) {
      const byCategory = await prisma.configuracion_pagina_producto.findFirst({
        where: { alcance: 'categoria', categoria_id, activo: true },
        include: FULL_INCLUDE,
      });
      if (byCategory) return this.toDomain(byCategory);
    }

    // 3. Global fallback
    const global = await prisma.configuracion_pagina_producto.findFirst({
      where: { alcance: 'global', activo: true },
      include: FULL_INCLUDE,
    });
    return global ? this.toDomain(global) : null;
  }

  async save(config: ConfiguracionPaginaProducto): Promise<ConfiguracionPaginaProducto> {
    const created = await prisma.configuracion_pagina_producto.create({
      data: this.toPrisma(config),
    });
    return this.toDomain(created);
  }

  async update(
    id: number,
    data: Partial<ConfiguracionPaginaProducto>
  ): Promise<ConfiguracionPaginaProducto | null> {
    try {
      const updateData: any = {};
      if (data.nombre !== undefined) updateData.nombre = data.nombre;
      if (data.alcance !== undefined) updateData.alcance = data.alcance;
      if (data.categoria_id !== undefined) updateData.categoria_id = data.categoria_id;
      if (data.producto_id !== undefined) updateData.producto_id = data.producto_id;
      if (data.activo !== undefined) updateData.activo = data.activo;

      const updated = await prisma.configuracion_pagina_producto.update({
        where: { id },
        data: updateData,
      });
      return this.toDomain(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<void> {
    await prisma.configuracion_pagina_producto.delete({ where: { id } });
  }

  private toDomain(prismaConfig: any): ConfiguracionPaginaProducto {
    return new ConfiguracionPaginaProductoEntity(
      prismaConfig.nombre,
      prismaConfig.alcance,
      prismaConfig.activo,
      prismaConfig.categoria_id,
      prismaConfig.producto_id,
      prismaConfig.id,
      prismaConfig.created_at,
      prismaConfig.updated_at,
      prismaConfig.secciones
    );
  }

  private toPrisma(config: ConfiguracionPaginaProducto): any {
    return {
      nombre: config.nombre,
      alcance: config.alcance,
      categoria_id: config.categoria_id ?? null,
      producto_id: config.producto_id ?? null,
      activo: config.activo,
    };
  }
}
