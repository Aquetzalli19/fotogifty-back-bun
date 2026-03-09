import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';
import { ProductPageSlideRepositoryPort } from '@domain/ports/product-page-slide.repository.port';
import { ProductPageOptionRepositoryPort } from '@domain/ports/product-page-option.repository.port';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export class ObtenerSeccionProductPageUseCase {
  constructor(
    private readonly sectionRepository: ProductPageSectionRepositoryPort,
    private readonly slideRepository: ProductPageSlideRepositoryPort,
    private readonly optionRepository: ProductPageOptionRepositoryPort
  ) {}

  async execute(sectionKey: string): Promise<Result> {
    try {
      const section = await this.sectionRepository.findBySectionKey(sectionKey);

      if (!section) {
        return {
          success: false,
          message: `Sección '${sectionKey}' no encontrada`,
          error: 'Sección no encontrada'
        };
      }

      const slides = await this.slideRepository.findBySectionKey(sectionKey);
      const allOptions = await this.optionRepository.findBySectionKey(sectionKey);

      const sectionOptions = allOptions.filter(o => o.slide_id === undefined || o.slide_id === null);
      const slidesWithOptions = slides.map(slide => {
        const slideOptions = allOptions.filter(o => o.slide_id === slide.id);
        return { ...slide, options: slideOptions };
      });

      return {
        success: true,
        data: { ...section, slides: slidesWithOptions, options: sectionOptions }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener la sección',
        error: error.message
      };
    }
  }
}
