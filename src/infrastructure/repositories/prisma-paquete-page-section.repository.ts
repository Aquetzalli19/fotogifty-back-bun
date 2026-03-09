import prisma from '@infrastructure/database/prisma.client';
import { PaquetePageSection, PaquetePageSectionEntity } from '@domain/entities/paquete-page-section.entity';
import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';

export class PrismaPaquetePageSectionRepository implements PaquetePageSectionRepositoryPort {
  async findByPaqueteId(paqueteId: number): Promise<PaquetePageSection[]> {
    const rows = await prisma.paquete_page_sections.findMany({
      where: { paquete_id: paqueteId },
      orderBy: { orden: 'asc' }
    });
    return rows.map(r => this.toDomain(r));
  }

  async findByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<PaquetePageSection | null> {
    const row = await prisma.paquete_page_sections.findUnique({
      where: { uq_paquete_page_sections: { paquete_id: paqueteId, section_key: sectionKey } }
    });
    return row ? this.toDomain(row) : null;
  }

  async upsert(paqueteId: number, sectionKey: string, data: Partial<PaquetePageSection>): Promise<PaquetePageSection> {
    const upsertData: any = {};
    if (data.titulo !== undefined) upsertData.titulo = data.titulo;
    if (data.subtitulo !== undefined) upsertData.subtitulo = data.subtitulo;
    if (data.descripcion !== undefined) upsertData.descripcion = data.descripcion;
    if (data.imagen_principal_url !== undefined) upsertData.imagen_principal_url = data.imagen_principal_url;
    if (data.orden !== undefined) upsertData.orden = data.orden;
    if (data.activo !== undefined) upsertData.activo = data.activo;

    const row = await prisma.paquete_page_sections.upsert({
      where: { uq_paquete_page_sections: { paquete_id: paqueteId, section_key: sectionKey } },
      create: { paquete_id: paqueteId, section_key: sectionKey, orden: 0, activo: true, ...upsertData },
      update: upsertData
    });
    return this.toDomain(row);
  }

  async deleteByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<boolean> {
    try {
      // Delete slides (and their options via cascade) first
      await prisma.paquete_page_slides.deleteMany({ where: { paquete_id: paqueteId, section_key: sectionKey } });
      // Delete section-level options
      await prisma.paquete_page_options.deleteMany({ where: { paquete_id: paqueteId, section_key: sectionKey } });
      await prisma.paquete_page_sections.delete({
        where: { uq_paquete_page_sections: { paquete_id: paqueteId, section_key: sectionKey } }
      });
      return true;
    } catch {
      return false;
    }
  }

  private toDomain(row: any): PaquetePageSection {
    return new PaquetePageSectionEntity(
      row.paquete_id,
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
}
