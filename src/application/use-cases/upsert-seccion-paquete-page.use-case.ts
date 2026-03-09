import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';
import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';
import { PaquetePageOptionRepositoryPort } from '@domain/ports/paquete-page-option.repository.port';
import { PaquetePageSection } from '@domain/entities/paquete-page-section.entity';
import { buildPaqueteSectionWithRelations } from './helpers/build-paquete-section-with-relations';
import prisma from '@infrastructure/database/prisma.client';

interface Result { success: boolean; data?: any; message?: string; error?: string; }

export class UpsertSeccionPaquetePageUseCase {
  constructor(
    private readonly sectionRepository: PaquetePageSectionRepositoryPort,
    private readonly slideRepository: PaquetePageSlideRepositoryPort,
    private readonly optionRepository: PaquetePageOptionRepositoryPort
  ) {}

  async execute(paqueteId: number, sectionKey: string, data: Partial<PaquetePageSection>): Promise<Result> {
    try {
      const paquete = await prisma.paquetes_predefinidos.findUnique({ where: { id: paqueteId } });
      if (!paquete) {
        return { success: false, message: `Paquete ${paqueteId} no encontrado`, error: 'Paquete no encontrado' };
      }

      const section = await this.sectionRepository.upsert(paqueteId, sectionKey, data);
      const sectionWithRelations = await buildPaqueteSectionWithRelations(section, this.slideRepository, this.optionRepository);
      return { success: true, data: sectionWithRelations };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al guardar la sección', error: error.message };
    }
  }
}
