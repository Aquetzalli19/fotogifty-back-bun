import { LandingOptionRepositoryPort } from '@domain/ports/landing-option.repository.port';

interface EliminarOptionLandingResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class EliminarOptionLandingUseCase {
  constructor(
    private readonly landingOptionRepository: LandingOptionRepositoryPort
  ) {}

  async execute(id: number): Promise<EliminarOptionLandingResult> {
    try {
      // 1. Validar que el ID es válido
      if (!id || typeof id !== 'number' || id <= 0) {
        return {
          success: false,
          message: 'El ID de la opción es requerido y debe ser un número positivo',
          error: 'ID inválido'
        };
      }

      // 2. Verificar que la opción existe
      const existingOption = await this.landingOptionRepository.findById(id);
      if (!existingOption) {
        return {
          success: false,
          message: 'Opción no encontrada',
          error: 'Opción no encontrada'
        };
      }

      // 3. Eliminar la opción
      const deleted = await this.landingOptionRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'Error al eliminar la opción',
          error: 'Error al eliminar'
        };
      }

      return {
        success: true,
        message: 'Opción eliminada exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar la opción',
        error: error.message
      };
    }
  }
}
