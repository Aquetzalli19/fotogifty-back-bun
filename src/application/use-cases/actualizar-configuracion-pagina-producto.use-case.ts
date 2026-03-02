import { ConfiguracionPaginaProductoRepositoryPort } from '@domain/ports/configuracion-pagina-producto.repository.port';
import {
  VALID_ALCANCES,
  AlcanceConfigPagina,
} from '@domain/entities/configuracion-pagina-producto.entity';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
  notFound?: boolean;
}

export class ActualizarConfiguracionPaginaProductoUseCase {
  constructor(private readonly repo: ConfiguracionPaginaProductoRepositoryPort) {}

  async execute(id: number, data: Record<string, any>): Promise<Result> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        return { success: false, message: 'Configuración no encontrada', notFound: true };
      }

      if (data.alcance !== undefined && !VALID_ALCANCES.includes(data.alcance as AlcanceConfigPagina)) {
        return { success: false, message: `El alcance debe ser uno de: ${VALID_ALCANCES.join(', ')}` };
      }

      const alcance = data.alcance ?? existing.alcance;
      if (alcance === 'categoria' && data.categoria_id === null && !existing.categoria_id) {
        return { success: false, message: 'Se requiere categoria_id para alcance "categoria"' };
      }
      if (alcance === 'producto' && data.producto_id === null && !existing.producto_id) {
        return { success: false, message: 'Se requiere producto_id para alcance "producto"' };
      }

      const updated = await this.repo.update(id, data);
      if (!updated) {
        return { success: false, message: 'Error al actualizar la configuración' };
      }

      return { success: true, data: updated, message: 'Configuración actualizada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al actualizar configuración' };
    }
  }
}
