import { LandingSlideRepositoryPort } from '@domain/ports/landing-slide.repository.port';
import { LandingSectionRepositoryPort } from '@domain/ports/landing-section.repository.port';

interface ReordenarSlidesLandingResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class ReordenarSlidesLandingUseCase {
  constructor(
    private readonly landingSlideRepository: LandingSlideRepositoryPort,
    private readonly landingSectionRepository: LandingSectionRepositoryPort
  ) {}

  async execute(
    section_key: string,
    slide_ids: number[]
  ): Promise<ReordenarSlidesLandingResult> {
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
      if (!Array.isArray(slide_ids) || slide_ids.length === 0) {
        return {
          success: false,
          message: 'Se requiere un array de IDs de slides',
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
      const invalidIds = slide_ids.filter(id => typeof id !== 'number' || id <= 0);
      if (invalidIds.length > 0) {
        return {
          success: false,
          message: 'Todos los IDs deben ser números positivos',
          error: 'IDs inválidos'
        };
      }

      // 5. Verificar que todos los slides pertenecen a la sección especificada
      const allSlides = await this.landingSlideRepository.findBySectionKey(section_key);
      const slideIdsSet = new Set(slide_ids);
      const allSlidesSet = new Set(allSlides.map(s => s.id));

      for (const id of slide_ids) {
        if (!allSlidesSet.has(id)) {
          return {
            success: false,
            message: `El slide con ID ${id} no pertenece a la sección ${section_key}`,
            error: 'Slide no pertenece a la sección'
          };
        }
      }

      // 6. Reordenar los slides
      await this.landingSlideRepository.reorder(section_key, slide_ids);

      return {
        success: true,
        message: 'Slides reordenados exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al reordenar los slides',
        error: error.message
      };
    }
  }
}
