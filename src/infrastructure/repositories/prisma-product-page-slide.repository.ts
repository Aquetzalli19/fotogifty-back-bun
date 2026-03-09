import prisma from '@infrastructure/database/prisma.client';
import { ProductPageSlide, ProductPageSlideEntity } from '@domain/entities/product-page-slide.entity';
import { ProductPageSlideRepositoryPort } from '@domain/ports/product-page-slide.repository.port';

export class PrismaProductPageSlideRepository implements ProductPageSlideRepositoryPort {
  async findById(id: number): Promise<ProductPageSlide | null> {
    const slide = await prisma.product_page_slides.findUnique({ where: { id } });
    return slide ? this.toDomain(slide) : null;
  }

  async findBySectionKey(sectionKey: string): Promise<ProductPageSlide[]> {
    const slides = await prisma.product_page_slides.findMany({
      where: { section_key: sectionKey },
      orderBy: { orden: 'asc' }
    });
    return slides.map(s => this.toDomain(s));
  }

  async save(slide: ProductPageSlide): Promise<ProductPageSlide> {
    if (slide.id) {
      const updated = await prisma.product_page_slides.update({
        where: { id: slide.id },
        data: this.toPrisma(slide)
      });
      return this.toDomain(updated);
    } else {
      const created = await prisma.product_page_slides.create({
        data: this.toPrisma(slide)
      });
      return this.toDomain(created);
    }
  }

  async update(id: number, data: Partial<ProductPageSlide>): Promise<ProductPageSlide | null> {
    try {
      const updateData: any = {};
      if (data.titulo !== undefined) updateData.titulo = data.titulo;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.imagen_url !== undefined) updateData.imagen_url = data.imagen_url;
      if (data.icono !== undefined) updateData.icono = data.icono;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;

      const updated = await prisma.product_page_slides.update({ where: { id }, data: updateData });
      return this.toDomain(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.product_page_slides.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getNextOrder(sectionKey: string): Promise<number> {
    const last = await prisma.product_page_slides.findFirst({
      where: { section_key: sectionKey },
      orderBy: { orden: 'desc' }
    });
    return last ? last.orden + 1 : 1;
  }

  async reorder(sectionKey: string, slideIds: number[]): Promise<void> {
    await prisma.$transaction(
      slideIds.map((id, index) =>
        prisma.product_page_slides.update({
          where: { id },
          data: { orden: index + 1 }
        })
      )
    );
  }

  private toDomain(row: any): ProductPageSlide {
    return new ProductPageSlideEntity(
      row.section_key,
      row.tipo,
      row.orden,
      row.activo,
      row.titulo,
      row.descripcion,
      row.imagen_url,
      row.icono,
      row.id,
      row.created_at,
      row.updated_at
    );
  }

  private toPrisma(slide: ProductPageSlide): any {
    return {
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
