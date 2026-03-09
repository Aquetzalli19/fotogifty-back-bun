import { ProductPageOptionRepositoryPort } from '@domain/ports/product-page-option.repository.port';

interface Result {
  success: boolean;
  message?: string;
  error?: string;
}

export class EliminarOptionProductPageUseCase {
  constructor(private readonly optionRepository: ProductPageOptionRepositoryPort) {}

  async execute(id: number): Promise<Result> {
    try {
      const existing = await this.optionRepository.findById(id);
      if (!existing) {
        return { success: false, message: `Opción ${id} no encontrada`, error: 'Opción no encontrada' };
      }

      const deleted = await this.optionRepository.delete(id);
      if (!deleted) {
        return { success: false, message: 'Error al eliminar la opción', error: 'Error de eliminación' };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar la opción',
        error: error.message
      };
    }
  }
}
