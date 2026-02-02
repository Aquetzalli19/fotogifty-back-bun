import prisma from '@infrastructure/database/prisma.client';
import { LandingOption, LandingOptionEntity } from '@domain/entities/landing-option.entity';
import { LandingOptionRepositoryPort } from '@domain/ports/landing-option.repository.port';

export class PrismaLandingOptionRepository implements LandingOptionRepositoryPort {
  async findById(id: number): Promise<LandingOption | null> {
    const option = await prisma.landing_options.findUnique({
      where: { id }
    });

    return option ? this.toDomain(option) : null;
  }

  async findBySectionKey(sectionKey: string): Promise<LandingOption[]> {
    const options = await prisma.landing_options.findMany({
      where: { section_key: sectionKey },
      orderBy: { orden: 'asc' }
    });

    return options.map(option => this.toDomain(option));
  }

  async save(option: LandingOption): Promise<LandingOption> {
    if (option.id) {
      // Actualizar existente
      const updated = await prisma.landing_options.update({
        where: { id: option.id },
        data: this.toPrisma(option)
      });
      return this.toDomain(updated);
    } else {
      // Crear nuevo
      const created = await prisma.landing_options.create({
        data: this.toPrisma(option)
      });
      return this.toDomain(created);
    }
  }

  async update(id: number, data: Partial<LandingOption>): Promise<LandingOption | null> {
    try {
      const updateData: any = {};

      if (data.texto !== undefined) updateData.texto = data.texto;
      if (data.orden !== undefined) updateData.orden = data.orden;
      if (data.activo !== undefined) updateData.activo = data.activo;

      const updated = await prisma.landing_options.update({
        where: { id },
        data: updateData
      });

      return this.toDomain(updated);
    } catch (error) {
      console.error('Error updating landing option:', error);
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await prisma.landing_options.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      console.error('Error deleting landing option:', error);
      return false;
    }
  }

  async getNextOrder(sectionKey: string): Promise<number> {
    const result = await prisma.landing_options.aggregate({
      where: { section_key: sectionKey },
      _max: { orden: true }
    });

    return (result._max.orden || 0) + 1;
  }

  async reorder(sectionKey: string, optionIds: number[]): Promise<void> {
    // Usar transacción para actualizar el orden de todas las opciones
    await prisma.$transaction(
      optionIds.map((optionId, index) =>
        prisma.landing_options.update({
          where: { id: optionId },
          data: { orden: index + 1 }
        })
      )
    );
  }

  private toDomain(prismaOption: any): LandingOption {
    return new LandingOptionEntity(
      prismaOption.section_key,
      prismaOption.texto,
      prismaOption.orden,
      prismaOption.activo,
      prismaOption.id,
      prismaOption.created_at,
      prismaOption.updated_at
    );
  }

  private toPrisma(option: LandingOption): any {
    return {
      section_key: option.section_key,
      texto: option.texto,
      orden: option.orden,
      activo: option.activo
    };
  }
}
