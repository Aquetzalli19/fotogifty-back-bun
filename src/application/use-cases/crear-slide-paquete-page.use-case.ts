import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';
import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';
import { PaquetePageSlide, PaquetePageSlideEntity } from '@domain/entities/paquete-page-slide.entity';

interface Input {
  paquete_id: number;
  section_key: string;
  tipo: string;
  titulo?: string;
  descripcion?: string;
  imagen_url?: string;
  icono?: string;
  orden?: number;
}
interface Result { success: boolean; data?: PaquetePageSlide; message?: string; error?: string; }

export class CrearSlidePaquetePageUseCase {
  constructor(
    private readonly slideRepository: PaquetePageSlideRepositoryPort,
    private readonly sectionRepository: PaquetePageSectionRepositoryPort
  ) {}

  async execute(input: Input): Promise<Result> {
    try {
      const section = await this.sectionRepository.findByPaqueteIdAndSectionKey(input.paquete_id, input.section_key);
      if (!section) {
        return { success: false, message: `Crea primero el override de sección '${input.section_key}' para este paquete`, error: 'Override de sección no existe' };
      }

      const orden = input.orden ?? await this.slideRepository.getNextOrder(input.paquete_id, input.section_key);
      const slide = new PaquetePageSlideEntity(
        input.paquete_id, input.section_key, input.tipo, orden, true,
        input.titulo, input.descripcion, input.imagen_url, input.icono
      );
      const created = await this.slideRepository.save(slide);
      return { success: true, data: created };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al crear el slide', error: error.message };
    }
  }
}
