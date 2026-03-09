import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';
import { ProductPageSlideRepositoryPort } from '@domain/ports/product-page-slide.repository.port';
import { ProductPageOptionRepositoryPort } from '@domain/ports/product-page-option.repository.port';

interface Result {
  success: boolean;
  data?: any[];
  message?: string;
  error?: string;
}

export class ObtenerSeccionesProductPageUseCase {
  constructor(
    private readonly sectionRepository: ProductPageSectionRepositoryPort,
    private readonly slideRepository: ProductPageSlideRepositoryPort,
    private readonly optionRepository: ProductPageOptionRepositoryPort
  ) {}

  async execute(): Promise<Result> {
    try {
      const sections = await this.sectionRepository.findAll();

      const sectionsWithRelations = await Promise.all(
        sections.map(async (section) => {
          const slides = await this.slideRepository.findBySectionKey(section.section_key);
          const allOptions = await this.optionRepository.findBySectionKey(section.section_key);

          // Separar options de sección (sin slide_id) de las de slide
          const sectionOptions = allOptions.filter(o => o.slide_id === undefined || o.slide_id === null);

          // Anidar options dentro de su slide
          const slidesWithOptions = slides.map(slide => {
            const slideOptions = allOptions.filter(o => o.slide_id === slide.id);
            return { ...slide, options: slideOptions };
          });

          return {
            ...section,
            slides: slidesWithOptions,
            options: sectionOptions
          };
        })
      );

      return { success: true, data: sectionsWithRelations };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener las secciones de la página de producto',
        error: error.message
      };
    }
  }
}
