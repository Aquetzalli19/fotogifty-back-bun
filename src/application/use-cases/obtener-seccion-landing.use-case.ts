import { LandingSectionRepositoryPort } from '@domain/ports/landing-section.repository.port';
import { LandingSlideRepositoryPort } from '@domain/ports/landing-slide.repository.port';
import { LandingOptionRepositoryPort } from '@domain/ports/landing-option.repository.port';

interface ObtenerSeccionLandingResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export class ObtenerSeccionLandingUseCase {
  constructor(
    private readonly landingSectionRepository: LandingSectionRepositoryPort,
    private readonly landingSlideRepository: LandingSlideRepositoryPort,
    private readonly landingOptionRepository: LandingOptionRepositoryPort
  ) {}

  async execute(sectionKey: string): Promise<ObtenerSeccionLandingResult> {
    try {
      if (!sectionKey || typeof sectionKey !== 'string') {
        return {
          success: false,
          message: 'La clave de sección es requerida',
          error: 'Clave de sección inválida'
        };
      }

      const section = await this.landingSectionRepository.findBySectionKey(sectionKey);

      if (!section) {
        return {
          success: false,
          message: 'Sección no encontrada',
          error: 'Sección no encontrada'
        };
      }

      const slides = await this.landingSlideRepository.findBySectionKey(sectionKey);
      const options = await this.landingOptionRepository.findBySectionKey(sectionKey);

      return {
        success: true,
        data: {
          section,
          slides,
          options
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener la sección de la landing',
        error: error.message
      };
    }
  }
}
