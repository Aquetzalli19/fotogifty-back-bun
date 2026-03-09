import prisma from '@infrastructure/database/prisma.client';
import { PaquetePageSlide, PaquetePageSlideEntity } from '@domain/entities/paquete-page-slide.entity';
import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';

export class PrismaPaquetePageSlideRepository implements PaquetePageSlideRepositoryPort {
  async findById(id: number): Promise<PaquetePageSlide | null> {
    const row = await prisma.paquete_page_slides.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<PaquetePageSlide[]> {
    const rows = await prisma.paquete_page_slides.findMany({
      where: { paquete_id: paqueteId, section_key: sectionKey },
      orderBy: { orden: 'asc' }
    });
    return rows.map(r => this.toDomain(r));
  }

  async save(slide: PaquetePageSlide): Promise<PaquetePageSlide> {
    if (slide.id) {
      const updated = await prisma.paquete_page_slides.update({ where: { id: slide.id }, data: this.toPrisma(slide) });
      return this.toDomain(updated);
    }
    const created = await prisma.paquete_page_slides.create({ data: this.toPrisma(slide) });
    return this.toDomain(created);
  }

  async saveMany(slides: Omit<PaquetePageSlide, 'id' | 'created_at' | 'updated_at'>[]): Promise<PaquetePageSlide[]> {
    // createMany doesn't return records in MySQL; insert one by one to get IDs
    const created = await Promise.all(
      slides.map(slide =>
        prisma.paquete_page_slides.create({ data: this.toPrisma(slide as PaquetePageSlide) })
      )
    );
    return created.map(r => this.toDomain(r));
  }

  async update(id: number, data: Partial<PaquetePageSlide>): Promise<PaquetePageSlide | null> {
    try {
      const updateData: any = {};
      if (data.titulo !== undefined) updateData.titulo = data.titulo;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.imagen_url !== undefined) updateData.imagen_url = data.imagen_url;
      if (data.icono !== undefined) updateData.icono = data.icono;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;
      const updated = await prisma.paquete_page_slides.update({ where: { id }, data: updateData });
      return this.toDomain(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.paquete_page_slides.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async deleteByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<void> {
    await prisma.paquete_page_slides.deleteMany({ where: { paquete_id: paqueteId, section_key: sectionKey } });
  }

  async getNextOrder(paqueteId: number, sectionKey: string): Promise<number> {
    const last = await prisma.paquete_page_slides.findFirst({
      where: { paquete_id: paqueteId, section_key: sectionKey },
      orderBy: { orden: 'desc' }
    });
    return last ? last.orden + 1 : 1;
  }

  async reorder(paqueteId: number, sectionKey: string, slideIds: number[]): Promise<void> {
    await prisma.$transaction(
      slideIds.map((id, index) =>
        prisma.paquete_page_slides.updateMany({
          where: { id, paquete_id: paqueteId, section_key: sectionKey },
          data: { orden: index + 1 }
        })
      )
    );
  }

  private toDomain(row: any): PaquetePageSlide {
    return new PaquetePageSlideEntity(
      row.paquete_id, row.section_key, row.tipo, row.orden, row.activo,
      row.titulo, row.descripcion, row.imagen_url, row.icono,
      row.id, row.created_at, row.updated_at
    );
  }

  private toPrisma(slide: PaquetePageSlide): any {
    return {
      paquete_id: slide.paquete_id,
      section_key: slide.section_key,
      tipo: slide.tipo,
      titulo: slide.titulo,
      descripcion: slide.descripcion,
      imagen_url: slide.imagen_url,
      icono: slide.icono,
      orden: slide.orden,
      activo: slide.activo
    };
  }
}
