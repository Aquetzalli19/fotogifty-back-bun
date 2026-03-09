import { ProductPageSlideRepositoryPort } from '@domain/ports/product-page-slide.repository.port';
import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';

interface Result {
  success: boolean;
  message?: string;
  error?: string;
}

export class ReordenarSlidesProductPageUseCase {
  constructor(
    private readonly slideRepository: ProductPageSlideRepositoryPort,
    private readonly sectionRepository: ProductPageSectionRepositoryPort
  ) {}

  async execute(sectionKey: string, slideIds: number[]): Promise<Result> {
    try {
      const section = await this.sectionRepository.findBySectionKey(sectionKey);
      if (!section) {
        return { success: false, message: `Sección '${sectionKey}' no encontrada`, error: 'Sección no encontrada' };
      }

      await this.slideRepository.reorder(sectionKey, slideIds);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al reordenar los slides',
        error: error.message
      };
    }
  }
}
