import { PaquetePageOptionRepositoryPort } from '@domain/ports/paquete-page-option.repository.port';
import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';
import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';
import { PaquetePageOption, PaquetePageOptionEntity } from '@domain/entities/paquete-page-option.entity';

interface Input {
  paquete_id: number;
  section_key: string;
  slide_id?: number;
  texto: string;
  texto_secundario?: string;
  texto_terciario?: string;
  texto_cuarto?: string;
  texto_quinto?: string;
  orden?: number;
}
interface Result { success: boolean; data?: PaquetePageOption; message?: string; error?: string; }

export class CrearOptionPaquetePageUseCase {
  constructor(
    private readonly optionRepository: PaquetePageOptionRepositoryPort,
    private readonly sectionRepository: PaquetePageSectionRepositoryPort,
    private readonly slideRepository: PaquetePageSlideRepositoryPort
  ) {}

  async execute(input: Input): Promise<Result> {
    try {
      const section = await this.sectionRepository.findByPaqueteIdAndSectionKey(input.paquete_id, input.section_key);
      if (!section) {
        return { success: false, message: `No existe override para la sección '${input.section_key}'`, error: 'Override no encontrado' };
      }

      if (input.slide_id !== undefined) {
        const slide = await this.slideRepository.findById(input.slide_id);
        if (!slide || slide.paquete_id !== input.paquete_id) {
          return { success: false, message: `Slide ${input.slide_id} no encontrado en este paquete`, error: 'Slide no encontrado' };
        }
      }

      const orden = input.orden ?? await this.optionRepository.getNextOrder(input.paquete_id, input.section_key, input.slide_id);
      const option = new PaquetePageOptionEntity(
        input.paquete_id, input.section_key, input.texto, orden, true,
        input.slide_id, input.texto_secundario, input.texto_terciario, input.texto_cuarto, input.texto_quinto
      );
      const created = await this.optionRepository.save(option);
      return { success: true, data: created };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al crear la opción', error: error.message };
    }
  }
}
