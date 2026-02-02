import prisma from '@infrastructure/database/prisma.client';
import { LandingSlide, LandingSlideEntity } from '@domain/entities/landing-slide.entity';
import { LandingSlideRepositoryPort } from '@domain/ports/landing-slide.repository.port';

export class PrismaLandingSlideRepository implements LandingSlideRepositoryPort {
  async findById(id: number): Promise<LandingSlide | null> {
    const slide = await prisma.landing_slides.findUnique({
      where: { id }
    });

    return slide ? this.toDomain(slide) : null;
  }

  async findBySectionKey(sectionKey: string): Promise<LandingSlide[]> {
    const slides = await prisma.landing_slides.findMany({
      where: { section_key: sectionKey },
      orderBy: { orden: 'asc' }
    });

    return slides.map(slide => this.toDomain(slide));
  }

  async save(slide: LandingSlide): Promise<LandingSlide> {
    if (slide.id) {
      // Actualizar existente
      const updated = await prisma.landing_slides.update({
        where: { id: slide.id },
        data: this.toPrisma(slide)
      });
      return this.toDomain(updated);
    } else {
      // Crear nuevo
      const created = await prisma.landing_slides.create({
        data: this.toPrisma(slide)
      });
      return this.toDomain(created);
    }
  }

  async update(id: number, data: Partial<LandingSlide>): Promise<LandingSlide | null> {
    try {
      const updateData: any = {};

      if (data.titulo !== undefined) updateData.titulo = data.titulo;
      if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
      if (data.imagen_url !== undefined) updateData.imagen_url = data.imagen_url;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;

      const updated = await prisma.landing_slides.update({
        where: { id },
        data: updateData
      });

      return this.toDomain(updated);
    } catch (error) {
      console.error('Error updating landing slide:', error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.landing_slides.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting landing slide:', error);
      return false;
    }
  }

  async getNextOrder(sectionKey: string): Promise<number> {
    const result = await prisma.landing_slides.aggregate({
      where: { section_key: sectionKey },
      _max: { orden: true }
    });

    return (result._max.orden || 0) + 1;
  }

  async reorder(sectionKey: string, slideIds: number[]): Promise<void> {
    // Usar transacción para actualizar el orden de todos los slides
    await prisma.$transaction(
      slideIds.map((slideId, index) =>
        prisma.landing_slides.update({
          where: { id: slideId },
          data: { orden: index + 1 }
        })
      )
    );
  }

  private toDomain(prismaSlide: any): LandingSlide {
    return new LandingSlideEntity(
      prismaSlide.section_key,
      prismaSlide.tipo,
      prismaSlide.imagen_url,
      prismaSlide.orden,
      prismaSlide.activo,
      prismaSlide.titulo,
      prismaSlide.descripcion,
      prismaSlide.id,
      prismaSlide.created_at,
      prismaSlide.updated_at
    );
  }

  private toPrisma(slide: LandingSlide): any {
    return {
      section_key: slide.section_key,
      tipo: slide.tipo,
      titulo: slide.titulo,
      descripcion: slide.descripcion,
      imagen_url: slide.imagen_url,
      orden: slide.orden,
      activo: slide.activo
    };
  }
}
