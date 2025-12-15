import prisma from '../../infrastructure/database/prisma.client';
import { Paquete } from '../entities/paquete.entity';
import { PaqueteRepositoryPort } from '../ports/paquete.repository.port';

export class PrismaPaqueteRepository implements PaqueteRepositoryPort {
  async findById(id: number): Promise<Paquete | null> {
    const paquete = await prisma.paquetes_predefinidos.findUnique({
      where: { id },
      include: {
        categoria: true
      }
    });

    return paquete ? this.toDomain(paquete) : null;
  }

  async save(paquete: Paquete): Promise<Paquete> {
    if (paquete.id) {
      // Actualizar
      const updated = await prisma.paquetes_predefinidos.update({
        where: { id: paquete.id },
        data: this.toPrisma(paquete),
        include: {
          categoria: true
        }
      });
      return this.toDomain(updated);
    } else {
      // Crear
      const created = await prisma.paquetes_predefinidos.create({
        data: this.toPrisma(paquete),
        include: {
          categoria: true
        }
      });
      return this.toDomain(created);
    }
  }

  async findByCategoriaId(categoriaId: number): Promise<Paquete[]> {
    const paquetes = await prisma.paquetes_predefinidos.findMany({
      where: {
        categoria_id: categoriaId,
        estado: true  // Solo paquetes activos
      },
      include: {
        categoria: true
      }
    });

    return paquetes.map(paquete => this.toDomain(paquete));
  }

  async findAll(estado?: boolean): Promise<Paquete[]> {
    // Si no se especifica estado, devuelve todos los paquetes
    // Si se especifica estado, filtra por ese valor
    const whereClause: any = {};
    if (estado !== undefined) {
      whereClause.estado = estado;
    }

    const paquetes = await prisma.paquetes_predefinidos.findMany({
      where: whereClause,
      include: {
        categoria: true
      }
    });

    return paquetes.map(paquete => this.toDomain(paquete));
  }

  async update(paquete: Paquete): Promise<Paquete> {
    if (!paquete.id) {
      throw new Error('El ID del paquete es requerido para actualizar');
    }

    const updated = await prisma.paquetes_predefinidos.update({
      where: { id: paquete.id },
      data: this.toPrisma(paquete),
      include: {
        categoria: true
      }
    });

    return this.toDomain(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.paquetes_predefinidos.update({
        where: { id },
        data: { estado: false } // Cambiar estado a inactivo en lugar de eliminar físicamente
      });
      return true;
    } catch (error) {
      console.error('Error al eliminar paquete:', error);
      return false;
    }
  }

  private toDomain(prismaPaquete: any): Paquete {
    return {
      id: prismaPaquete.id,
      nombre: prismaPaquete.nombre,
      categoria_id: prismaPaquete.categoria_id,
      descripcion: prismaPaquete.descripcion,
      cantidad_fotos: prismaPaquete.cantidad_fotos,
      precio: Number(prismaPaquete.precio),
      estado: prismaPaquete.estado,
      resolucion_foto: prismaPaquete.resolucion_foto,
      ancho_foto: Number(prismaPaquete.ancho_foto),
      alto_foto: Number(prismaPaquete.alto_foto)
    };
  }

  private toPrisma(paquete: Paquete): any {
    return {
      nombre: paquete.nombre,
      categoria_id: paquete.categoria_id || null,
      tipo_paquete_id: paquete.tipo_paquete_id || null, // Aseguramos que este campo se maneje explícitamente como opcional
      descripcion: paquete.descripcion,
      cantidad_fotos: paquete.cantidad_fotos,
      precio: paquete.precio,
      estado: paquete.estado,
      resolucion_foto: paquete.resolucion_foto,
      ancho_foto: paquete.ancho_foto,
      alto_foto: paquete.alto_foto
    };
  }
}