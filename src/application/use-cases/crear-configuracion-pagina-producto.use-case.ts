import { ConfiguracionPaginaProductoRepositoryPort } from '@domain/ports/configuracion-pagina-producto.repository.port';
import {
  ConfiguracionPaginaProductoEntity,
  VALID_ALCANCES,
  AlcanceConfigPagina,
} from '@domain/entities/configuracion-pagina-producto.entity';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
}

export class CrearConfiguracionPaginaProductoUseCase {
  constructor(private readonly repo: ConfiguracionPaginaProductoRepositoryPort) {}

  async execute(
    nombre: string,
    alcance: string,
    activo: boolean = true,
    categoria_id?: number | null,
    producto_id?: number | null
  ): Promise<Result> {
    try {
      if (!nombre || typeof nombre !== 'string') {
        return { success: false, message: 'El nombre es requerido' };
      }

      if (!VALID_ALCANCES.includes(alcance as AlcanceConfigPagina)) {
        return { success: false, message: `El alcance debe ser uno de: ${VALID_ALCANCES.join(', ')}` };
      }

      if (alcance === 'categoria' && !categoria_id) {
        return { success: false, message: 'Se requiere categoria_id para alcance "categoria"' };
      }

      if (alcance === 'producto' && !producto_id) {
        return { success: false, message: 'Se requiere producto_id para alcance "producto"' };
      }

      const config = ConfiguracionPaginaProductoEntity.create(
        nombre,
        alcance as AlcanceConfigPagina,
        activo,
        categoria_id,
        producto_id
      );

      const saved = await this.repo.save(config);
      return { success: true, data: saved, message: 'Configuración creada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al crear configuración' };
    }
  }
}
