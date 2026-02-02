import { LandingSlideRepositoryPort } from '@domain/ports/landing-slide.repository.port';

interface EliminarSlideLandingResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class EliminarSlideLandingUseCase {
  constructor(
    private readonly landingSlideRepository: LandingSlideRepositoryPort
  ) {}

  async execute(id: number): Promise<EliminarSlideLandingResult> {
    try {
      // 1. Validar que el ID es válido
      if (!id || typeof id !== 'number' || id <= 0) {
        return {
          success: false,
          message: 'El ID del slide es requerido y debe ser un número positivo',
          error: 'ID inválido'
        };
      }

      // 2. Verificar que el slide existe
      const existingSlide = await this.landingSlideRepository.findById(id);
      if (!existingSlide) {
        return {
          success: false,
          message: 'Slide no encontrado',
          error: 'Slide no encontrado'
        };
      }

      // 3. Eliminar el slide
      const deleted = await this.landingSlideRepository.delete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'Error al eliminar el slide',
          error: 'Error al eliminar'
        };
      }

      return {
        success: true,
        message: 'Slide eliminado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar el slide',
        error: error.message
      };
    }
  }
}
