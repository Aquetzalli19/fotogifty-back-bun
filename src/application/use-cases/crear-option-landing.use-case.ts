import { LandingOptionRepositoryPort } from '@domain/ports/landing-option.repository.port';
import { LandingSectionRepositoryPort } from '@domain/ports/landing-section.repository.port';
import { LandingOptionEntity } from '@domain/entities/landing-option.entity';

interface CrearOptionLandingResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export class CrearOptionLandingUseCase {
  constructor(
    private readonly landingOptionRepository: LandingOptionRepositoryPort,
    private readonly landingSectionRepository: LandingSectionRepositoryPort
  ) {}

  async execute(
    section_key: string,
    texto: string,
    orden?: number
  ): Promise<CrearOptionLandingResult> {
    try {
      // 1. Validar campos requeridos
      if (!section_key || typeof section_key !== 'string') {
        return {
          success: false,
          message: 'La clave de sección es requerida',
          error: 'Clave de sección inválida'
        };
      }

      if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
        return {
          success: false,
          message: 'El texto de la opción es requerido',
          error: 'Texto inválido'
        };
      }

      // 2. Verificar que la sección existe
      const section = await this.landingSectionRepository.findBySectionKey(section_key);
      if (!section) {
        return {
          success: false,
          message: 'La sección especificada no existe',
          error: 'Sección no encontrada'
        };
      }

      // 3. Si no se proporciona orden, obtener el siguiente número de orden
      const finalOrden = orden !== undefined ? orden : await this.landingOptionRepository.getNextOrder(section_key);

      // 4. Crear la opción
      const nuevaOption = LandingOptionEntity.create(
        section_key,
        texto.trim(),
        finalOrden,
        true
      );

      const optionGuardada = await this.landingOptionRepository.save(nuevaOption);

      return {
        success: true,
        data: optionGuardada,
        message: 'Opción creada exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear la opción',
        error: error.message
      };
    }
  }
}
