import prisma from '@infrastructure/database/prisma.client';
import { ProductPageOption, ProductPageOptionEntity } from '@domain/entities/product-page-option.entity';
import { ProductPageOptionRepositoryPort } from '@domain/ports/product-page-option.repository.port';

export class PrismaProductPageOptionRepository implements ProductPageOptionRepositoryPort {
  async findById(id: number): Promise<ProductPageOption | null> {
    const option = await prisma.product_page_options.findUnique({ where: { id } });
    return option ? this.toDomain(option) : null;
  }

  async findBySectionKey(sectionKey: string): Promise<ProductPageOption[]> {
    const options = await prisma.product_page_options.findMany({
      where: { section_key: sectionKey },
      orderBy: { orden: 'asc' }
    });
    return options.map(o => this.toDomain(o));
  }

  async findBySlideId(slideId: number): Promise<ProductPageOption[]> {
    const options = await prisma.product_page_options.findMany({
      where: { slide_id: slideId },
      orderBy: { orden: 'asc' }
    });
    return options.map(o => this.toDomain(o));
  }

  async save(option: ProductPageOption): Promise<ProductPageOption> {
    if (option.id) {
      const updated = await prisma.product_page_options.update({
        where: { id: option.id },
        data: this.toPrisma(option)
      });
      return this.toDomain(updated);
    } else {
      const created = await prisma.product_page_options.create({
        data: this.toPrisma(option)
      });
      return this.toDomain(created);
    }
  }

  async update(id: number, data: Partial<ProductPageOption>): Promise<ProductPageOption | null> {
    try {
      const updateData: any = {};
      if (data.texto !== undefined) updateData.texto = data.texto;
      if (data.texto_secundario !== undefined) updateData.texto_secundario = data.texto_secundario;
      if (data.texto_terciario !== undefined) updateData.texto_terciario = data.texto_terciario;
      if (data.texto_cuarto !== undefined) updateData.texto_cuarto = data.texto_cuarto;
      if (data.texto_quinto !== undefined) updateData.texto_quinto = data.texto_quinto;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;

      const updated = await prisma.product_page_options.update({ where: { id }, data: updateData });
      return this.toDomain(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.product_page_options.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getNextOrder(sectionKey: string, slideId?: number): Promise<number> {
    const where = slideId !== undefined
      ? { slide_id: slideId }
      : { section_key: sectionKey, slide_id: null };

    const last = await prisma.product_page_options.findFirst({
      where,
      orderBy: { orden: 'desc' }
    });
    return last ? last.orden + 1 : 1;
  }

  async reorder(sectionKey: string, optionIds: number[]): Promise<void> {
    await prisma.$transaction(
      optionIds.map((id, index) =>
        prisma.product_page_options.update({
          where: { id },
          data: { orden: index + 1 }
        })
      )
    );
  }

  private toDomain(row: any): ProductPageOption {
    return new ProductPageOptionEntity(
      row.section_key,
      row.texto,
      row.orden,
      row.activo,
      row.slide_id ?? undefined,
      row.texto_secundario ?? undefined,
      row.texto_terciario ?? undefined,
      row.texto_cuarto ?? undefined,
      row.texto_quinto ?? undefined,
      row.id,
      row.created_at,
      row.updated_at
    );
  }

  private toPrisma(option: ProductPageOption): any {
    return {
      section_key: option.section_key,
      slide_id: option.slide_id ?? null,
      texto: option.texto,
      texto_secundario: option.texto_secundario ?? null,
      texto_terciario: option.texto_terciario ?? null,
      texto_cuarto: option.texto_cuarto ?? null,
      texto_quinto: option.texto_quinto ?? null,
      orden: option.orden,
      activo: option.activo
    };
  }
}
