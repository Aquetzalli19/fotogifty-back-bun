import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';
import { ProductPageSection } from '@domain/entities/product-page-section.entity';

interface Result {
  success: boolean;
  data?: ProductPageSection;
  message?: string;
  error?: string;
}

export class ActualizarSeccionProductPageUseCase {
  constructor(private readonly sectionRepository: ProductPageSectionRepositoryPort) {}

  async execute(sectionKey: string, data: Partial<ProductPageSection>): Promise<Result> {
    try {
      const existing = await this.sectionRepository.findBySectionKey(sectionKey);
      if (!existing) {
        return { success: false, message: `Sección '${sectionKey}' no encontrada`, error: 'Sección no encontrada' };
      }

      const updated = await this.sectionRepository.update(sectionKey, data);
      if (!updated) {
        return { success: false, message: 'Error al actualizar la sección', error: 'Error de actualización' };
      }

      return { success: true, data: updated };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar la sección',
        error: error.message
      };
    }
  }
}
