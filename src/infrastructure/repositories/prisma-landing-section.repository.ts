import prisma from '@infrastructure/database/prisma.client';
import { LandingSection, LandingSectionEntity } from '@domain/entities/landing-section.entity';
import { LandingSectionRepositoryPort } from '@domain/ports/landing-section.repository.port';

export class PrismaLandingSectionRepository implements LandingSectionRepositoryPort {
  async findAll(): Promise<LandingSection[]> {
    const sections = await prisma.landing_sections.findMany({
      orderBy: { orden: 'asc' }
    });

    return sections.map(section => this.toDomain(section));
  }

  async findBySectionKey(sectionKey: string): Promise<LandingSection | null> {
    const section = await prisma.landing_sections.findUnique({
      where: { section_key: sectionKey }
    });

    return section ? this.toDomain(section) : null;
  }

  async update(sectionKey: string, data: Partial<LandingSection>): Promise<LandingSection | null> {
    try {
      const updateData: any = {};

      // Solo incluir campos que están definidos
      if (data.titulo !== undefined) updateData.titulo = data.titulo;
      if (data.subtitulo !== undefined) updateData.subtitulo = data.subtitulo;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.texto_primario !== undefined) updateData.texto_primario = data.texto_primario;
      if (data.texto_secundario !== undefined) updateData.texto_secundario = data.texto_secundario;
      if (data.color_primario !== undefined) updateData.color_primario = data.color_primario;
      if (data.color_secundario !== undefined) updateData.color_secundario = data.color_secundario;
      if (data.color_gradiente_inicio !== undefined) updateData.color_gradiente_inicio = data.color_gradiente_inicio;
      if (data.color_gradiente_medio !== undefined) updateData.color_gradiente_medio = data.color_gradiente_medio;
      if (data.color_gradiente_fin !== undefined) updateData.color_gradiente_fin = data.color_gradiente_fin;
      if (data.imagen_principal_url !== undefined) updateData.imagen_principal_url = data.imagen_principal_url;
      if (data.imagen_fondo_url !== undefined) updateData.imagen_fondo_url = data.imagen_fondo_url;
      if (data.boton_texto !== undefined) updateData.boton_texto = data.boton_texto;
      if (data.boton_color !== undefined) updateData.boton_color = data.boton_color;
      if (data.boton_enlace !== undefined) updateData.boton_enlace = data.boton_enlace;
      if (data.configuracion_extra !== undefined) updateData.configuracion_extra = data.configuracion_extra;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;

      const updated = await prisma.landing_sections.update({
        where: { section_key: sectionKey },
        data: updateData
      });

      return this.toDomain(updated);
    } catch (error) {
      console.error('Error updating landing section:', error);
      return null;
    }
  }

  async save(section: LandingSection): Promise<LandingSection> {
    if (section.id) {
      // Actualizar existente
      const updated = await prisma.landing_sections.update({
        where: { id: section.id },
        data: this.toPrisma(section)
      });
      return this.toDomain(updated);
    } else {
      // Crear nuevo
      const created = await prisma.landing_sections.create({
        data: this.toPrisma(section)
      });
      return this.toDomain(created);
    }
  }

  private toDomain(prismaSection: any): LandingSection {
    return new LandingSectionEntity(
      prismaSection.section_key,
      prismaSection.orden,
      prismaSection.activo,
      prismaSection.titulo,
      prismaSection.subtitulo,
      prismaSection.descripcion,
      prismaSection.texto_primario,
      prismaSection.texto_secundario,
      prismaSection.color_primario,
      prismaSection.color_secundario,
      prismaSection.color_gradiente_inicio,
      prismaSection.color_gradiente_medio,
      prismaSection.color_gradiente_fin,
      prismaSection.imagen_principal_url,
      prismaSection.imagen_fondo_url,
      prismaSection.boton_texto,
      prismaSection.boton_color,
      prismaSection.boton_enlace,
      prismaSection.configuracion_extra,
      prismaSection.id,
      prismaSection.created_at,
      prismaSection.updated_at
    );
  }

  private toPrisma(section: LandingSection): any {
    return {
      section_key: section.section_key,
      titulo: section.titulo,
      subtitulo: section.subtitulo,
      descripcion: section.descripcion,
      texto_primario: section.texto_primario,
      texto_secundario: section.texto_secundario,
      color_primario: section.color_primario,
      color_secundario: section.color_secundario,
      color_gradiente_inicio: section.color_gradiente_inicio,
      color_gradiente_medio: section.color_gradiente_medio,
      color_gradiente_fin: section.color_gradiente_fin,
      imagen_principal_url: section.imagen_principal_url,
      imagen_fondo_url: section.imagen_fondo_url,
      boton_texto: section.boton_texto,
      boton_color: section.boton_color,
      boton_enlace: section.boton_enlace,
      configuracion_extra: section.configuracion_extra,
      orden: section.orden,
      activo: section.activo
    };
  }
}
