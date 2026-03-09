import { ProductPageOptionRepositoryPort } from '@domain/ports/product-page-option.repository.port';
import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';

interface Result {
  success: boolean;
  message?: string;
  error?: string;
}

export class ReordenarOptionsProductPageUseCase {
  constructor(
    private readonly optionRepository: ProductPageOptionRepositoryPort,
    private readonly sectionRepository: ProductPageSectionRepositoryPort
  ) {}

  async execute(sectionKey: string, optionIds: number[]): Promise<Result> {
    try {
      const section = await this.sectionRepository.findBySectionKey(sectionKey);
      if (!section) {
        return { success: false, message: `Sección '${sectionKey}' no encontrada`, error: 'Sección no encontrada' };
      }

      await this.optionRepository.reorder(sectionKey, optionIds);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al reordenar las opciones',
        error: error.message
      };
    }
  }
}
