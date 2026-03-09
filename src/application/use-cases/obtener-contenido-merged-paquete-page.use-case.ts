import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';
import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';
import { PaquetePageOptionRepositoryPort } from '@domain/ports/paquete-page-option.repository.port';
import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';
import { ProductPageSlideRepositoryPort } from '@domain/ports/product-page-slide.repository.port';
import { ProductPageOptionRepositoryPort } from '@domain/ports/product-page-option.repository.port';
import { buildPaqueteSectionWithRelations } from './helpers/build-paquete-section-with-relations';
import prisma from '@infrastructure/database/prisma.client';

const SECTION_KEYS = ['gallery', 'why_choose', 'paper_types', 'print_services', 'product_types', 'sizes_table'];

interface Result { success: boolean; data?: any[]; message?: string; error?: string; }

export class ObtenerContenidoMergedPaquetePageUseCase {
  constructor(
    private readonly paqueteSectionRepository: PaquetePageSectionRepositoryPort,
    private readonly paqueteSlideRepository: PaquetePageSlideRepositoryPort,
    private readonly paqueteOptionRepository: PaquetePageOptionRepositoryPort,
    private readonly globalSectionRepository: ProductPageSectionRepositoryPort,
    private readonly globalSlideRepository: ProductPageSlideRepositoryPort,
    private readonly globalOptionRepository: ProductPageOptionRepositoryPort
  ) {}

  async execute(paqueteId: number): Promise<Result> {
    try {
      const paquete = await prisma.paquetes_predefinidos.findUnique({ where: { id: paqueteId } });
      if (!paquete) {
        return { success: false, message: `Paquete ${paqueteId} no encontrado`, error: 'Paquete no encontrado' };
      }

      const perProductSections = await this.paqueteSectionRepository.findByPaqueteId(paqueteId);
      const perProductKeys = new Map(perProductSections.map(s => [s.section_key, s]));

      const merged = await Promise.all(
        SECTION_KEYS.map(async (sectionKey) => {
          const perProductSection = perProductKeys.get(sectionKey);

          if (perProductSection) {
            const sectionData = await buildPaqueteSectionWithRelations(
              perProductSection,
              this.paqueteSlideRepository,
              this.paqueteOptionRepository
            );
            return { ...sectionData, _source: 'per_product' };
          }

          // Fallback to global
          const globalSection = await this.globalSectionRepository.findBySectionKey(sectionKey);
          if (!globalSection) return null;

          const globalSlides = await this.globalSlideRepository.findBySectionKey(sectionKey);
          const allGlobalOptions = await this.globalOptionRepository.findBySectionKey(sectionKey);

          const sectionOptions = allGlobalOptions.filter(o => o.slide_id === undefined || o.slide_id === null);
          const slidesWithOptions = globalSlides.map(slide => ({
            ...slide,
            options: allGlobalOptions.filter(o => o.slide_id === slide.id)
          }));

          return { ...globalSection, slides: slidesWithOptions, options: sectionOptions, _source: 'global' };
        })
      );

      return { success: true, data: merged.filter(Boolean) };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener el contenido merged', error: error.message };
    }
  }
}
