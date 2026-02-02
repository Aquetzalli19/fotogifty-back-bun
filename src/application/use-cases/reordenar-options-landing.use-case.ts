import { LandingOptionRepositoryPort } from '@domain/ports/landing-option.repository.port';
import { LandingSectionRepositoryPort } from '@domain/ports/landing-section.repository.port';

interface ReordenarOptionsLandingResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ReordenarOptionsLandingUseCase {
  constructor(
    private readonly landingOptionRepository: LandingOptionRepositoryPort,
    private readonly landingSectionRepository: LandingSectionRepositoryPort
  ) {}

  async execute(
    section_key: string,
    option_ids: number[]
  ): Promise<ReordenarOptionsLandingResult> {
    try {
      // 1. Validar que la clave de sección es válida
      if (!section_key || typeof section_key !== 'string') {
        return {
          success: false,
          message: 'La clave de sección es requerida',
          error: 'Clave de sección inválida'
        };
      }

      // 2. Validar que se proporcionó un array de IDs
      if (!Array.isArray(option_ids) || option_ids.length === 0) {
        return {
          success: false,
          message: 'Se requiere un array de IDs de opciones',
          error: 'Array de IDs inválido'
        };
      }

      // 3. Verificar que la sección existe
      const section = await this.landingSectionRepository.findBySectionKey(section_key);
      if (!section) {
        return {
          success: false,
          message: 'La sección especificada no existe',
          error: 'Sección no encontrada'
        };
      }

      // 4. Validar que todos los IDs son números positivos
      const invalidIds = option_ids.filter(id => typeof id !== 'number' || id <= 0);
      if (invalidIds.length > 0) {
        return {
          success: false,
          message: 'Todos los IDs deben ser números positivos',
          error: 'IDs inválidos'
        };
      }

      // 5. Verificar que todas las opciones pertenecen a la sección especificada
      const allOptions = await this.landingOptionRepository.findBySectionKey(section_key);
      const optionIdsSet = new Set(option_ids);
      const allOptionsSet = new Set(allOptions.map(o => o.id));

      for (const id of option_ids) {
        if (!allOptionsSet.has(id)) {
          return {
            success: false,
            message: `La opción con ID ${id} no pertenece a la sección ${section_key}`,
            error: 'Opción no pertenece a la sección'
          };
        }
      }

      // 6. Reordenar las opciones
      await this.landingOptionRepository.reorder(section_key, option_ids);

      return {
        success: true,
        message: 'Opciones reordenadas exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al reordenar las opciones',
        error: error.message
      };
    }
  }
}
