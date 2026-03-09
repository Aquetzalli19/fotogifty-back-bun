import prisma from '@infrastructure/database/prisma.client';
import { ProductPageSection, ProductPageSectionEntity } from '@domain/entities/product-page-section.entity';
import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';

export class PrismaProductPageSectionRepository implements ProductPageSectionRepositoryPort {
  async findAll(): Promise<ProductPageSection[]> {
    const sections = await prisma.product_page_sections.findMany({
      orderBy: { orden: 'asc' }
    });
    return sections.map(s => this.toDomain(s));
  }

  async findBySectionKey(sectionKey: string): Promise<ProductPageSection | null> {
    const section = await prisma.product_page_sections.findUnique({
      where: { section_key: sectionKey }
    });
    return section ? this.toDomain(section) : null;
  }

  async update(sectionKey: string, data: Partial<ProductPageSection>): Promise<ProductPageSection | null> {
    try {
      const updateData: any = {};
      if (data.titulo !== undefined) updateData.titulo = data.titulo;
      if (data.subtitulo !== undefined) updateData.subtitulo = data.subtitulo;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.imagen_principal_url !== undefined) updateData.imagen_principal_url = data.imagen_principal_url;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;

      const updated = await prisma.product_page_sections.update({
        where: { section_key: sectionKey },
        data: updateData
      });
      return this.toDomain(updated);
    } catch {
      return null;
    }
  }

  async save(section: ProductPageSection): Promise<ProductPageSection> {
    if (section.id) {
      const updated = await prisma.product_page_sections.update({
        where: { id: section.id },
        data: this.toPrisma(section)
      });
      return this.toDomain(updated);
    } else {
      const created = await prisma.product_page_sections.create({
        data: this.toPrisma(section)
      });
      return this.toDomain(created);
    }
  }

  private toDomain(row: any): ProductPageSection {
    return new ProductPageSectionEntity(
      row.section_key,
      row.orden,
      row.activo,
      row.titulo,
      row.subtitulo,
      row.descripcion,
      row.imagen_principal_url,
      row.id,
      row.created_at,
      row.updated_at
    );
  }

  private toPrisma(section: ProductPageSection): any {
    return {
      section_key: section.section_key,
      titulo: section.titulo,
      subtitulo: section.subtitulo,
      descripcion: section.descripcion,
      imagen_principal_url: section.imagen_principal_url,
      orden: section.orden,
      activo: section.activo
    };
  }
}
