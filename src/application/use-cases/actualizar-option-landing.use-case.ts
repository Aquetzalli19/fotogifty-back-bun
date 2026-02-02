import { LandingOptionRepositoryPort } from '@domain/ports/landing-option.repository.port';
import { LandingOption } from '@domain/entities/landing-option.entity';

interface ActualizarOptionLandingResult {
  success: boolean;
  data?: LandingOption;
  message?: string;
  error?: string;
}

export class ActualizarOptionLandingUseCase {
  constructor(
    private readonly landingOptionRepository: LandingOptionRepositoryPort
  ) {}

  async execute(
    id: number,
    data: Partial<LandingOption>
  ): Promise<ActualizarOptionLandingResult> {
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

      // 3. Validar el texto si se proporciona
      if (data.texto !== undefined && (typeof data.texto !== 'string' || data.texto.trim().length === 0)) {
        return {
          success: false,
          message: 'El texto de la opción debe ser una cadena no vacía si se proporciona',
          error: 'Texto inválido'
        };
      }

      // 4. Actualizar la opción
      const updatedOption = await this.landingOptionRepository.update(id, data);

      if (!updatedOption) {
        return {
          success: false,
          message: 'Error al actualizar la opción',
          error: 'Error al actualizar'
        };
      }

      return {
        success: true,
        data: updatedOption,
        message: 'Opción actualizada exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar la opción',
        error: error.message
      };
    }
  }
}
