import { LandingSectionRepositoryPort } from '@domain/ports/landing-section.repository.port';
import { LandingSlideRepositoryPort } from '@domain/ports/landing-slide.repository.port';
import { LandingOptionRepositoryPort } from '@domain/ports/landing-option.repository.port';

interface ObtenerSeccionesLandingResult {
  success: boolean;
  data?: any[];
  message?: string;
  error?: string;
}

export class ObtenerSeccionesLandingUseCase {
  constructor(
    private readonly landingSectionRepository: LandingSectionRepositoryPort,
    private readonly landingSlideRepository: LandingSlideRepositoryPort,
    private readonly landingOptionRepository: LandingOptionRepositoryPort
  ) {}

  async execute(): Promise<ObtenerSeccionesLandingResult> {
    try {
      const sections = await this.landingSectionRepository.findAll();

      // Para cada sección, obtener sus slides y options
      const sectionsWithRelations = await Promise.all(
        sections.map(async (section) => {
          const slides = await this.landingSlideRepository.findBySectionKey(section.section_key);
          const options = await this.landingOptionRepository.findBySectionKey(section.section_key);

          return {
            ...section,
            slides,
            options
          };
        })
      );

      return {
        success: true,
        data: sectionsWithRelations
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener las secciones de la landing',
        error: error.message
      };
    }
  }
}
