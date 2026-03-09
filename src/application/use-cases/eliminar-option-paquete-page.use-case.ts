import { PaquetePageOptionRepositoryPort } from '@domain/ports/paquete-page-option.repository.port';

interface Result { success: boolean; message?: string; error?: string; }

export class EliminarOptionPaquetePageUseCase {
  constructor(private readonly optionRepository: PaquetePageOptionRepositoryPort) {}

  async execute(paqueteId: number, optionId: number): Promise<Result> {
    try {
      const existing = await this.optionRepository.findById(optionId);
      if (!existing || existing.paquete_id !== paqueteId) {
        return { success: false, message: `Opción ${optionId} no encontrada`, error: 'Opción no encontrada' };
      }
      await this.optionRepository.delete(optionId);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al eliminar la opción', error: error.message };
    }
  }
}
