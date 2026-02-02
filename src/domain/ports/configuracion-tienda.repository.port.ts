import { ConfiguracionTienda } from '../entities/configuracion-tienda.entity';

export interface ConfiguracionTiendaRepositoryPort {
  /**
   * Obtiene la configuración actual de la tienda
   * Solo debe existir un registro (id=1)
   */
  obtener(): Promise<ConfiguracionTienda | null>;

  /**
   * Actualiza la configuración de la tienda
   * @param configuracion - Datos parciales o completos de la configuración a actualizar
   * @param actualizadoPor - ID del usuario que realiza la actualización
   */
  actualizar(configuracion: Partial<ConfiguracionTienda>, actualizadoPor?: number): Promise<ConfiguracionTienda>;
}
