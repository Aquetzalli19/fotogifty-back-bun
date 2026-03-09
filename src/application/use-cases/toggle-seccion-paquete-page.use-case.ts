import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';

interface Result { success: boolean; data?: { activo: boolean }; message?: string; error?: string; }

export class ToggleSeccionPaquetePageUseCase {
  constructor(private readonly sectionRepository: PaquetePageSectionRepositoryPort) {}

  async execute(paqueteId: number, sectionKey: string): Promise<Result> {
    try {
      const existing = await this.sectionRepository.findByPaqueteIdAndSectionKey(paqueteId, sectionKey);
      if (!existing) {
        return { success: false, message: `No existe override para la sección '${sectionKey}'`, error: 'Override no encontrado' };
      }

      const updated = await this.sectionRepository.upsert(paqueteId, sectionKey, { activo: !existing.activo });
      return { success: true, data: { activo: updated.activo } };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al cambiar el estado', error: error.message };
    }
  }
}
