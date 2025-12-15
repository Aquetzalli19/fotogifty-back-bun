import prisma from '../database/prisma.client';
import { Foto } from '../../domain/entities/foto.entity';
import { FotoRepositoryPort } from '../../domain/ports/foto.repository.port';

export class PrismaFotoRepository implements FotoRepositoryPort {
  async save(foto: Foto): Promise<Foto> {
    const created = await prisma.fotos.create({
      data: {
        usuario_id: foto.usuario_id,
        pedido_id: foto.pedido_id, // Esto ahora es opcional gracias a la actualización del esquema
        item_pedido_id: foto.item_pedido_id,
        nombre_archivo: foto.nombre_archivo,
        ruta_almacenamiento: foto.ruta_almacenamiento,
        tamaño_archivo: foto.tamaño_archivo,
        ancho_foto: foto.ancho_foto,
        alto_foto: foto.alto_foto,
        resolucion_foto: foto.resolucion_foto,
        procesada: foto.procesada || false
      }
    });

    return this.toDomain(created);
  }

  async findById(id: number): Promise<Foto | null> {
    const foto = await prisma.fotos.findUnique({
      where: { id }
    });
    
    return foto ? this.toDomain(foto) : null;
  }

  async findByUsuarioId(usuarioId: number): Promise<Foto[]> {
    const fotos = await prisma.fotos.findMany({
      where: { usuario_id: usuarioId }
    });
    
    return fotos.map(foto => this.toDomain(foto));
  }

  private toDomain(prismaFoto: any): Foto {
    return {
      id: prismaFoto.id,
      usuario_id: prismaFoto.usuario_id,
      pedido_id: prismaFoto.pedido_id,
      item_pedido_id: prismaFoto.item_pedido_id,
      nombre_archivo: prismaFoto.nombre_archivo,
      ruta_almacenamiento: prismaFoto.ruta_almacenamiento,
      tamaño_archivo: prismaFoto.tamaño_archivo,
      ancho_foto: prismaFoto.ancho_foto ? Number(prismaFoto.ancho_foto) : undefined,
      alto_foto: prismaFoto.alto_foto ? Number(prismaFoto.alto_foto) : undefined,
      resolucion_foto: prismaFoto.resolucion_foto || undefined,
      fecha_subida: prismaFoto.fecha_subida,
      procesada: prismaFoto.procesada
    };
  }
}
