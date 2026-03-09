import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';

interface Result { success: boolean; message?: string; error?: string; }

export class EliminarSeccionPaquetePageUseCase {
  constructor(private readonly sectionRepository: PaquetePageSectionRepositoryPort) {}

  async execute(paqueteId: number, sectionKey: string): Promise<Result> {
    try {
      const existing = await this.sectionRepository.findByPaqueteIdAndSectionKey(paqueteId, sectionKey);
      if (!existing) {
        return { success: false, message: `No existe override para la sección '${sectionKey}'`, error: 'Override no encontrado' };
      }

      await this.sectionRepository.deleteByPaqueteIdAndSectionKey(paqueteId, sectionKey);
      return { success: true, message: 'Sección revertida a global' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al eliminar el override', error: error.message };
    }
  }
}
