import prisma from '@infrastructure/database/prisma.client';
import { ImagenTemporal, ImagenTemporalEntity } from '@domain/entities/imagen-temporal.entity';
import { ImagenTemporalRepositoryPort } from '@domain/ports/imagen-temporal.repository.port';

export class PrismaImagenTemporalRepository implements ImagenTemporalRepositoryPort {
  async findById(id: number): Promise<ImagenTemporal | null> {
    const imagen = await prisma.imagenes_temporales.findUnique({
      where: { id }
    });

    return imagen ? this.toDomain(imagen) : null;
  }

  async findByUsuarioId(usuarioId: number): Promise<ImagenTemporal[]> {
    const imagenes = await prisma.imagenes_temporales.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { created_at: 'desc' }
    });

    return imagenes.map(i => this.toDomain(i));
  }

  async findByS3Key(s3Key: string): Promise<ImagenTemporal | null> {
    const imagen = await prisma.imagenes_temporales.findFirst({
      where: { s3_key: s3Key }
    });

    return imagen ? this.toDomain(imagen) : null;
  }

  async save(imagen: ImagenTemporal): Promise<ImagenTemporal> {
    const created = await prisma.imagenes_temporales.create({
      data: {
        usuario_id: imagen.usuario_id,
        ...this.toPrisma(imagen)
      }
    });

    return this.toDomain(created);
  }

  async update(id: number, s3_url: string): Promise<ImagenTemporal | null> {
    try {
      const updated = await prisma.imagenes_temporales.update({
        where: { id },
        data: { s3_url }
      });

      return this.toDomain(updated);
    } catch (error) {
      console.error('Error updating imagen temporal:', error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.imagenes_temporales.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting imagen temporal:', error);
      return false;
    }
  }

  async deleteAllByUsuarioId(usuarioId: number): Promise<number> {
    const result = await prisma.imagenes_temporales.deleteMany({
      where: { usuario_id: usuarioId }
    });

    return result.count;
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();

    const result = await prisma.imagenes_temporales.deleteMany({
      where: {
        expires_at: {
          lt: now
        }
      }
    });

    return result.count;
  }

  private toDomain(prismaImagen: any): ImagenTemporal {
    return new ImagenTemporalEntity(
      prismaImagen.usuario_id,
      prismaImagen.s3_key,
      prismaImagen.original_filename,
      prismaImagen.mime_type,
      prismaImagen.size_bytes,
      prismaImagen.expires_at,
      prismaImagen.s3_url,
      prismaImagen.id,
      prismaImagen.created_at
    );
  }

  private toPrisma(imagen: ImagenTemporal): any {
    return {
      s3_key: imagen.s3_key,
      s3_url: imagen.s3_url,
      original_filename: imagen.original_filename,
      mime_type: imagen.mime_type,
      size_bytes: imagen.size_bytes,
      expires_at: imagen.expires_at
    };
  }
}
