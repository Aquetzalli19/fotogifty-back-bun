import { LandingSlideRepositoryPort } from '@domain/ports/landing-slide.repository.port';
import { LandingSectionRepositoryPort } from '@domain/ports/landing-section.repository.port';
import { LandingSlideEntity } from '@domain/entities/landing-slide.entity';

interface CrearSlideLandingResult {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export class CrearSlideLandingUseCase {
  constructor(
    private readonly landingSlideRepository: LandingSlideRepositoryPort,
    private readonly landingSectionRepository: LandingSectionRepositoryPort
  ) {}

  async execute(
    section_key: string,
    tipo: string,
    imagen_url: string,
    titulo?: string,
    descripcion?: string,
    orden?: number
  ): Promise<CrearSlideLandingResult> {
    try {
      // 1. Validar campos requeridos
      if (!section_key || typeof section_key !== 'string') {
        return {
          success: false,
          message: 'La clave de sección es requerida',
          error: 'Clave de sección inválida'
        };
      }

      if (!tipo || typeof tipo !== 'string') {
        return {
          success: false,
          message: 'El tipo de slide es requerido',
          error: 'Tipo inválido'
        };
      }

      if (!imagen_url || typeof imagen_url !== 'string') {
        return {
          success: false,
          message: 'La URL de la imagen es requerida',
          error: 'URL inválida'
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
      const finalOrden = orden !== undefined ? orden : await this.landingSlideRepository.getNextOrder(section_key);

      // 4. Crear el slide
      const nuevoSlide = LandingSlideEntity.create(
        section_key,
        tipo,
        imagen_url,
        finalOrden,
        true,
        titulo,
        descripcion
      );

      const slideGuardado = await this.landingSlideRepository.save(nuevoSlide);

      return {
        success: true,
        data: slideGuardado,
        message: 'Slide creado exitosamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear el slide',
        error: error.message
      };
    }
  }
}
