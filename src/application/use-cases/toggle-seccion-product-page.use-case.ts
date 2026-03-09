import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';

interface Result {
  success: boolean;
  data?: { activo: boolean };
  message?: string;
  error?: string;
}

export class ToggleSeccionProductPageUseCase {
  constructor(private readonly sectionRepository: ProductPageSectionRepositoryPort) {}

  async execute(sectionKey: string): Promise<Result> {
    try {
      const existing = await this.sectionRepository.findBySectionKey(sectionKey);
      if (!existing) {
        return { success: false, message: `Sección '${sectionKey}' no encontrada`, error: 'Sección no encontrada' };
      }

      const updated = await this.sectionRepository.update(sectionKey, { activo: !existing.activo });
      if (!updated) {
        return { success: false, message: 'Error al cambiar el estado de la sección', error: 'Error de actualización' };
      }

      return { success: true, data: { activo: updated.activo } };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al cambiar el estado de la sección',
        error: error.message
      };
    }
  }
}
