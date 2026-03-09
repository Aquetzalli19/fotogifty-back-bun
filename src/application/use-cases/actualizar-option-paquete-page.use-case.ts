import { PaquetePageOptionRepositoryPort } from '@domain/ports/paquete-page-option.repository.port';
import { PaquetePageOption } from '@domain/entities/paquete-page-option.entity';

interface Result { success: boolean; data?: PaquetePageOption; message?: string; error?: string; }

export class ActualizarOptionPaquetePageUseCase {
  constructor(private readonly optionRepository: PaquetePageOptionRepositoryPort) {}

  async execute(paqueteId: number, optionId: number, data: Partial<PaquetePageOption>): Promise<Result> {
    try {
      const existing = await this.optionRepository.findById(optionId);
      if (!existing || existing.paquete_id !== paqueteId) {
        return { success: false, message: `Opción ${optionId} no encontrada`, error: 'Opción no encontrada' };
      }
      const updated = await this.optionRepository.update(optionId, data);
      if (!updated) return { success: false, message: 'Error al actualizar la opción', error: 'Error de actualización' };
      return { success: true, data: updated };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al actualizar la opción', error: error.message };
    }
  }
}
