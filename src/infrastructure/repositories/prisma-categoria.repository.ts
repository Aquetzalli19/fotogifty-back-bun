import prisma from '../../infrastructure/database/prisma.client';
import { Categoria } from '../entities/categoria.entity';
import { CategoriaRepositoryPort } from '../ports/categoria.repository.port';

export class PrismaCategoriaRepository implements CategoriaRepositoryPort {
  async findById(id: number): Promise<Categoria | null> {
    const categoria = await prisma.categorias.findUnique({
      where: { id }
    });

    return categoria ? this.toDomain(categoria) : null;
  }

  async save(categoria: Categoria): Promise<Categoria> {
    if (categoria.id) {
      // Actualizar
      const updated = await prisma.categorias.update({
        where: { id: categoria.id },
        data: this.toPrisma(categoria)
      });
      return this.toDomain(updated);
    } else {
      // Crear
      const created = await prisma.categorias.create({
        data: this.toPrisma(categoria)
      });
      return this.toDomain(created);
    }
  }

  async findAll(): Promise<Categoria[]> {
    const categorias = await prisma.categorias.findMany({
      where: {
        activo: true  // Solo categorías activas
      }
    });

    return categorias.map(categoria => this.toDomain(categoria));
  }

  async update(categoria: Categoria): Promise<Categoria> {
    if (!categoria.id) {
      throw new Error('El ID de la categoría es requerido para actualizar');
    }

    const updated = await prisma.categorias.update({
      where: { id: categoria.id },
      data: this.toPrisma(categoria)
    });

    return this.toDomain(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.categorias.update({
        where: { id },
        data: { activo: false } // Cambiar estado a inactivo en lugar de eliminar físicamente
      });
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      return false;
    }
  }

  private toDomain(prismaCategoria: any): Categoria {
    return {
      id: prismaCategoria.id,
      nombre: prismaCategoria.nombre,
      descripcion: prismaCategoria.descripcion,
      activo: prismaCategoria.activo,
      fecha_creacion: prismaCategoria.fecha_creacion
    };
  }

  private toPrisma(categoria: Categoria): any {
    return {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      activo: categoria.activo
    };
  }
}