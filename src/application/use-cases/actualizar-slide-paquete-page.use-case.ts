import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';
import { PaquetePageSlide } from '@domain/entities/paquete-page-slide.entity';

interface Result { success: boolean; data?: PaquetePageSlide; message?: string; error?: string; }

export class ActualizarSlidePaquetePageUseCase {
  constructor(private readonly slideRepository: PaquetePageSlideRepositoryPort) {}

  async execute(paqueteId: number, slideId: number, data: Partial<PaquetePageSlide>): Promise<Result> {
    try {
      const existing = await this.slideRepository.findById(slideId);
      if (!existing || existing.paquete_id !== paqueteId) {
        return { success: false, message: `Slide ${slideId} no encontrado`, error: 'Slide no encontrado' };
      }
      const updated = await this.slideRepository.update(slideId, data);
      if (!updated) return { success: false, message: 'Error al actualizar el slide', error: 'Error de actualización' };
      return { success: true, data: updated };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al actualizar el slide', error: error.message };
    }
  }
}
