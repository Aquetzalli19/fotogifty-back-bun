import { CustomizacionTemporalRepositoryPort } from '@domain/ports/customizacion-temporal.repository.port';

interface EliminarCustomizacionTemporalResult {
  success: boolean;
  message?: string;
  error?: string;
}

export class EliminarCustomizacionTemporalUseCase {
  constructor(
    private readonly customizacionTemporalRepository: CustomizacionTemporalRepositoryPort
  ) {}

  async execute(
    usuarioId: number,
    cartItemId: string,
    instanceIndex: number
  ): Promise<EliminarCustomizacionTemporalResult> {
    try {
      if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
        return {
          success: false,
          message: 'ID de usuario inválido',
          error: 'ID de usuario inválido'
        };
      }

      const deleted = await this.customizacionTemporalRepository.delete(
        usuarioId,
        cartItemId,
        instanceIndex
      );

      if (!deleted) {
        return {
          success: false,
          message: 'No se pudo eliminar la customización o no existe',
          error: 'Error al eliminar'
        };
      }

      return {
        success: true,
        message: 'Customización eliminada correctamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar la customización temporal',
        error: error.message
      };
    }
  }
}
