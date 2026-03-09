import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';
import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';

interface Result { success: boolean; message?: string; error?: string; }

export class ReordenarSlidesPaquetePageUseCase {
  constructor(
    private readonly slideRepository: PaquetePageSlideRepositoryPort,
    private readonly sectionRepository: PaquetePageSectionRepositoryPort
  ) {}

  async execute(paqueteId: number, sectionKey: string, slideIds: number[]): Promise<Result> {
    try {
      const section = await this.sectionRepository.findByPaqueteIdAndSectionKey(paqueteId, sectionKey);
      if (!section) {
        return { success: false, message: `No existe override para la sección '${sectionKey}'`, error: 'Override no encontrado' };
      }
      await this.slideRepository.reorder(paqueteId, sectionKey, slideIds);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al reordenar los slides', error: error.message };
    }
  }
}
