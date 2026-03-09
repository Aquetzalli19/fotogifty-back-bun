import { ProductPageSlideRepositoryPort } from '@domain/ports/product-page-slide.repository.port';
import { ProductPageSlide } from '@domain/entities/product-page-slide.entity';

interface Result {
  success: boolean;
  data?: ProductPageSlide;
  message?: string;
  error?: string;
}

export class ActualizarSlideProductPageUseCase {
  constructor(private readonly slideRepository: ProductPageSlideRepositoryPort) {}

  async execute(id: number, data: Partial<ProductPageSlide>): Promise<Result> {
    try {
      const existing = await this.slideRepository.findById(id);
      if (!existing) {
        return { success: false, message: `Slide ${id} no encontrado`, error: 'Slide no encontrado' };
      }

      const updated = await this.slideRepository.update(id, data);
      if (!updated) {
        return { success: false, message: 'Error al actualizar el slide', error: 'Error de actualización' };
      }

      return { success: true, data: updated };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar el slide',
        error: error.message
      };
    }
  }
}
