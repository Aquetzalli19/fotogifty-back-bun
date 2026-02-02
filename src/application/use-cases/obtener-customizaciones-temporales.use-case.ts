import { CustomizacionTemporalRepositoryPort } from '@domain/ports/customizacion-temporal.repository.port';
import { CustomizacionTemporal } from '@domain/entities/customizacion-temporal.entity';

interface ObtenerCustomizacionesTemporalesResult {
  success: boolean;
  data?: CustomizacionTemporal[];
  message?: string;
  error?: string;
}

export class ObtenerCustomizacionesTemporalesUseCase {
  constructor(
    private readonly customizacionTemporalRepository: CustomizacionTemporalRepositoryPort
  ) {}

  async execute(usuarioId: number): Promise<ObtenerCustomizacionesTemporalesResult> {
    try {
      if (!usuarioId || typeof usuarioId !== 'number' || usuarioId <= 0) {
        return {
          success: false,
          message: 'ID de usuario inválido',
          error: 'ID de usuario inválido'
        };
      }

      const customizaciones = await this.customizacionTemporalRepository.findByUsuarioId(usuarioId);

      return {
        success: true,
        data: customizaciones
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener las customizaciones temporales',
        error: error.message
      };
    }
  }
}
