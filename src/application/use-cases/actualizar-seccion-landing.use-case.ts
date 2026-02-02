import { LandingSectionRepositoryPort } from '@domain/ports/landing-section.repository.port';
import { LandingSection } from '@domain/entities/landing-section.entity';

interface ActualizarSeccionLandingResult {
  success: boolean;
  data?: LandingSection;
  message?: string;
  error?: string;
}

export class ActualizarSeccionLandingUseCase {
  constructor(
    private readonly landingSectionRepository: LandingSectionRepositoryPort
  ) {}

  async execute(
    sectionKey: string,
    data: Partial<LandingSection>
  ): Promise<ActualizarSeccionLandingResult> {
    try {
      // 1. Validar que la clave de sección es válida
      if (!sectionKey || typeof sectionKey !== 'string') {
        return {
          success: false,
          message: 'La clave de sección es requerida',
          error: 'Clave de sección inválida'
        };
      }

      // 2. Verificar que la sección existe
      const existingSection = await this.landingSectionRepository.findBySectionKey(sectionKey);
      if (!existingSection) {
        return {
          success: false,
          message: 'Sección no encontrada',
          error: 'Sección no encontrada'
        };
      }

      // 3. Validar colores si se proporcionan (deben ser en formato hexadecimal)
      const colorFields = [
        'color_primario',
        'color_secundario',
        'color_gradiente_inicio',
        'color_gradiente_medio',
        'color_gradiente_fin',
        'boton_color'
      ];

      for (const field of colorFields) {
        if ((data as any)[field] !== undefined) {
          const color = (data as any)[field];
          if (color && !/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color)) {
            return {
              success: false,
              message: `El campo ${field} debe ser un color hexadecimal válido (#RRGGBB o #RRGGBBAA)`,
              error: 'Color inválido'
            };
          }
        }
      }

      // 4. Actualizar la sección
      const updatedSection = await this.landingSectionRepository.update(sectionKey, data);

      if (!updatedSection) {
        return {
          success: false,
          message: 'Error al actualizar la sección',
          error: 'Error al actualizar'
        };
      }

      return {
        success: true,
        data: updatedSection,
        message: 'Sección actualizada exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar la sección de la landing',
        error: error.message
      };
    }
  }
}
