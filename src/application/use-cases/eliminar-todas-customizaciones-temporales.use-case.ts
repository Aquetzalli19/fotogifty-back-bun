import { CustomizacionTemporalRepositoryPort } from '@domain/ports/customizacion-temporal.repository.port';

interface EliminarTodasCustomizacionesTemporalesResult {
  success: boolean;
  deletedCount?: number;
  message?: string;
  error?: string;
}

export class EliminarTodasCustomizacionesTemporalesUseCase {
  constructor(
    private readonly customizacionTemporalRepository: CustomizacionTemporalRepositoryPort
  ) {}

  async execute(usuarioId: number): Promise<EliminarTodasCustomizacionesTemporalesResult> {
    try {
      if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
        return {
          success: false,
          message: 'ID de usuario inválido',
          error: 'ID de usuario inválido'
        };
      }

      const deletedCount = await this.customizacionTemporalRepository.deleteAllByUsuarioId(usuarioId);

      return {
        success: true,
        deletedCount,
        message: `${deletedCount} customizaciones eliminadas correctamente`
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar todas las customizaciones temporales',
        error: error.message
      };
    }
  }
}
