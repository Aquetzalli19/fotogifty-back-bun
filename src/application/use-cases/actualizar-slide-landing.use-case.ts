import { LandingSlideRepositoryPort } from '@domain/ports/landing-slide.repository.port';
import { LandingSlide } from '@domain/entities/landing-slide.entity';

interface ActualizarSlideLandingResult {
  success: boolean;
  data?: LandingSlide;
  message?: string;
  error?: string;
}

export class ActualizarSlideLandingUseCase {
  constructor(
    private readonly landingSlideRepository: LandingSlideRepositoryPort
  ) {}

  async execute(
    id: number,
    data: Partial<LandingSlide>
  ): Promise<ActualizarSlideLandingResult> {
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

      // 3. Actualizar el slide
      const updatedSlide = await this.landingSlideRepository.update(id, data);

      if (!updatedSlide) {
        return {
          success: false,
          message: 'Error al actualizar el slide',
          error: 'Error al actualizar'
        };
      }

      return {
        success: true,
        data: updatedSlide,
        message: 'Slide actualizado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar el slide',
        error: error.message
      };
    }
  }
}
