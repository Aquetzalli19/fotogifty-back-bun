import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';

interface Result { success: boolean; message?: string; error?: string; }

export class EliminarSlidePaquetePageUseCase {
  constructor(private readonly slideRepository: PaquetePageSlideRepositoryPort) {}

  async execute(paqueteId: number, slideId: number): Promise<Result> {
    try {
      const existing = await this.slideRepository.findById(slideId);
      if (!existing || existing.paquete_id !== paqueteId) {
        return { success: false, message: `Slide ${slideId} no encontrado`, error: 'Slide no encontrado' };
      }
      await this.slideRepository.delete(slideId);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al eliminar el slide', error: error.message };
    }
  }
}
