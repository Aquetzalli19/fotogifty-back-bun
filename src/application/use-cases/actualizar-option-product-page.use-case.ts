import { ProductPageOptionRepositoryPort } from '@domain/ports/product-page-option.repository.port';
import { ProductPageOption } from '@domain/entities/product-page-option.entity';

interface Result {
  success: boolean;
  data?: ProductPageOption;
  message?: string;
  error?: string;
}

export class ActualizarOptionProductPageUseCase {
  constructor(private readonly optionRepository: ProductPageOptionRepositoryPort) {}

  async execute(id: number, data: Partial<ProductPageOption>): Promise<Result> {
    try {
      const existing = await this.optionRepository.findById(id);
      if (!existing) {
        return { success: false, message: `Opción ${id} no encontrada`, error: 'Opción no encontrada' };
      }

      const updated = await this.optionRepository.update(id, data);
      if (!updated) {
        return { success: false, message: 'Error al actualizar la opción', error: 'Error de actualización' };
      }

      return { success: true, data: updated };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar la opción',
        error: error.message
      };
    }
  }
}
