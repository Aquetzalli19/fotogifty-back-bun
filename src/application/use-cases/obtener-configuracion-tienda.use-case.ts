import { ConfiguracionTienda } from '@domain/entities/configuracion-tienda.entity';
import { ConfiguracionTiendaRepositoryPort } from '@domain/ports/configuracion-tienda.repository.port';

interface ObtenerConfiguracionTiendaResult {
  success: boolean;
  data?: ConfiguracionTienda;
  message?: string;
  error?: string;
}

export class ObtenerConfiguracionTiendaUseCase {
  constructor(private readonly configuracionTiendaRepository: ConfiguracionTiendaRepositoryPort) {}

  async execute(): Promise<ObtenerConfiguracionTiendaResult> {
    try {
      const configuracion = await this.configuracionTiendaRepository.obtener();

      if (!configuracion) {
        return {
          success: false,
          message: 'Configuración de tienda no encontrada'
        };
      }

      return {
        success: true,
        data: configuracion
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener la configuración de tienda',
        error: error.message
      };
    }
  }
}
