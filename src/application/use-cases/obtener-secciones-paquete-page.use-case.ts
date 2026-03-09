import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';
import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';
import { PaquetePageOptionRepositoryPort } from '@domain/ports/paquete-page-option.repository.port';
import { buildPaqueteSectionWithRelations } from './helpers/build-paquete-section-with-relations';

interface Result { success: boolean; data?: any[]; message?: string; error?: string; }

export class ObtenerSeccionesPaquetePageUseCase {
  constructor(
    private readonly sectionRepository: PaquetePageSectionRepositoryPort,
    private readonly slideRepository: PaquetePageSlideRepositoryPort,
    private readonly optionRepository: PaquetePageOptionRepositoryPort
  ) {}

  async execute(paqueteId: number): Promise<Result> {
    try {
      const sections = await this.sectionRepository.findByPaqueteId(paqueteId);
      const data = await Promise.all(
        sections.map(s => buildPaqueteSectionWithRelations(s, this.slideRepository, this.optionRepository))
      );
      return { success: true, data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener las secciones', error: error.message };
    }
  }
}
