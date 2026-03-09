import { PaquetePageOptionRepositoryPort } from '@domain/ports/paquete-page-option.repository.port';
import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';

interface Result { success: boolean; message?: string; error?: string; }

export class ReordenarOptionsPaquetePageUseCase {
  constructor(
    private readonly optionRepository: PaquetePageOptionRepositoryPort,
    private readonly sectionRepository: PaquetePageSectionRepositoryPort
  ) {}

  async execute(paqueteId: number, sectionKey: string, optionIds: number[]): Promise<Result> {
    try {
      const section = await this.sectionRepository.findByPaqueteIdAndSectionKey(paqueteId, sectionKey);
      if (!section) {
        return { success: false, message: `No existe override para la sección '${sectionKey}'`, error: 'Override no encontrado' };
      }
      await this.optionRepository.reorder(paqueteId, sectionKey, optionIds);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al reordenar las opciones', error: error.message };
    }
  }
}
