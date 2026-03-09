import { ProductPageSlideRepositoryPort } from '@domain/ports/product-page-slide.repository.port';

interface Result {
  success: boolean;
  message?: string;
  error?: string;
}

export class EliminarSlideProductPageUseCase {
  constructor(private readonly slideRepository: ProductPageSlideRepositoryPort) {}

  async execute(id: number): Promise<Result> {
    try {
      const existing = await this.slideRepository.findById(id);
      if (!existing) {
        return { success: false, message: `Slide ${id} no encontrado`, error: 'Slide no encontrado' };
      }

      const deleted = await this.slideRepository.delete(id);
      if (!deleted) {
        return { success: false, message: 'Error al eliminar el slide', error: 'Error de eliminación' };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar el slide',
        error: error.message
      };
    }
  }
}
