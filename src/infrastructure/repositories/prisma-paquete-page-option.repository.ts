import prisma from '@infrastructure/database/prisma.client';
import { PaquetePageOption, PaquetePageOptionEntity } from '@domain/entities/paquete-page-option.entity';
import { PaquetePageOptionRepositoryPort } from '@domain/ports/paquete-page-option.repository.port';

export class PrismaPaquetePageOptionRepository implements PaquetePageOptionRepositoryPort {
  async findById(id: number): Promise<PaquetePageOption | null> {
    const row = await prisma.paquete_page_options.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<PaquetePageOption[]> {
    const rows = await prisma.paquete_page_options.findMany({
      where: { paquete_id: paqueteId, section_key: sectionKey },
      orderBy: { orden: 'asc' }
    });
    return rows.map(r => this.toDomain(r));
  }

  async findBySlideId(slideId: number): Promise<PaquetePageOption[]> {
    const rows = await prisma.paquete_page_options.findMany({
      where: { slide_id: slideId },
      orderBy: { orden: 'asc' }
    });
    return rows.map(r => this.toDomain(r));
  }

  async save(option: PaquetePageOption): Promise<PaquetePageOption> {
    if (option.id) {
      const updated = await prisma.paquete_page_options.update({ where: { id: option.id }, data: this.toPrisma(option) });
      return this.toDomain(updated);
    }
    const created = await prisma.paquete_page_options.create({ data: this.toPrisma(option) });
    return this.toDomain(created);
  }

  async saveMany(options: Omit<PaquetePageOption, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    if (options.length === 0) return;
    await prisma.paquete_page_options.createMany({
      data: options.map(o => this.toPrisma(o as PaquetePageOption))
    });
  }

  async update(id: number, data: Partial<PaquetePageOption>): Promise<PaquetePageOption | null> {
    try {
      const updateData: any = {};
      if (data.texto !== undefined) updateData.texto = data.texto;
      if (data.texto_secundario !== undefined) updateData.texto_secundario = data.texto_secundario;
      if (data.texto_terciario !== undefined) updateData.texto_terciario = data.texto_terciario;
      if (data.texto_cuarto !== undefined) updateData.texto_cuarto = data.texto_cuarto;
      if (data.texto_quinto !== undefined) updateData.texto_quinto = data.texto_quinto;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;
      const updated = await prisma.paquete_page_options.update({ where: { id }, data: updateData });
      return this.toDomain(updated);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.paquete_page_options.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async deleteByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<void> {
    await prisma.paquete_page_options.deleteMany({ where: { paquete_id: paqueteId, section_key: sectionKey } });
  }

  async getNextOrder(paqueteId: number, sectionKey: string, slideId?: number): Promise<number> {
    const where = slideId !== undefined
      ? { slide_id: slideId }
      : { paquete_id: paqueteId, section_key: sectionKey, slide_id: null };
    const last = await prisma.paquete_page_options.findFirst({ where, orderBy: { orden: 'desc' } });
    return last ? last.orden + 1 : 1;
  }

  async reorder(paqueteId: number, sectionKey: string, optionIds: number[]): Promise<void> {
    await prisma.$transaction(
      optionIds.map((id, index) =>
        prisma.paquete_page_options.updateMany({
          where: { id, paquete_id: paqueteId, section_key: sectionKey },
          data: { orden: index + 1 }
        })
      )
    );
  }

  private toDomain(row: any): PaquetePageOption {
    return new PaquetePageOptionEntity(
      row.paquete_id, row.section_key, row.texto, row.orden, row.activo,
      row.slide_id ?? undefined,
      row.texto_secundario ?? undefined,
      row.texto_terciario ?? undefined,
      row.texto_cuarto ?? undefined,
      row.texto_quinto ?? undefined,
      row.id, row.created_at, row.updated_at
    );
  }

  private toPrisma(option: PaquetePageOption): any {
    return {
      paquete_id: option.paquete_id,
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
