import { ConfiguracionTienda } from '@domain/entities/configuracion-tienda.entity';
import { ConfiguracionTiendaRepositoryPort } from '@domain/ports/configuracion-tienda.repository.port';

interface ActualizarConfiguracionTiendaResult {
  success: boolean;
  data?: ConfiguracionTienda;
  message?: string;
  error?: string;
}

export class ActualizarConfiguracionTiendaUseCase {
  constructor(private readonly configuracionTiendaRepository: ConfiguracionTiendaRepositoryPort) {}

  async execute(
    configuracion: Partial<ConfiguracionTienda>,
    usuarioId?: number
  ): Promise<ActualizarConfiguracionTiendaResult> {
    try {
      // Validar coordenadas si están presentes
      if (configuracion.latitud !== undefined) {
        if (configuracion.latitud < -90 || configuracion.latitud > 90) {
          return {
            success: false,
            message: 'Latitud inválida (debe estar entre -90 y 90)'
          };
        }
      }

      if (configuracion.longitud !== undefined) {
        if (configuracion.longitud < -180 || configuracion.longitud > 180) {
          return {
            success: false,
            message: 'Longitud inválida (debe estar entre -180 y 180)'
          };
        }
      }

      // Actualizar configuración
      const configuracionActualizada = await this.configuracionTiendaRepository.actualizar(
        configuracion,
        usuarioId
      );

      return {
        success: true,
        data: configuracionActualizada,
        message: 'Configuración de tienda actualizada correctamente'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar la configuración de tienda',
        error: error.message
      };
    }
  }
}
