import { ConfiguracionPaginaProductoRepositoryPort } from '@domain/ports/configuracion-pagina-producto.repository.port';

const DEFAULT_CONFIG = {
  id: null,
  nombre: 'Configuración por defecto',
  alcance: 'global',
  activo: true,
  es_default: true,
  secciones: [
    { id: null, tipo: 'galeria', titulo: 'Galería', activo: true, orden: 0, estilo: null, configuracion: null, pestanas: [], caracteristicas: [] },
    { id: null, tipo: 'info_producto', titulo: 'Información del producto', activo: true, orden: 1, estilo: null, configuracion: null, pestanas: [], caracteristicas: [] },
    { id: null, tipo: 'especificaciones', titulo: 'Especificaciones', activo: true, orden: 2, estilo: null, configuracion: null, pestanas: [], caracteristicas: [] },
    { id: null, tipo: 'selector_cantidad', titulo: null, activo: true, orden: 3, estilo: null, configuracion: null, pestanas: [], caracteristicas: [] },
    { id: null, tipo: 'botones_accion', titulo: null, activo: true, orden: 4, estilo: null, configuracion: null, pestanas: [], caracteristicas: [] },
  ],
};

interface Result {
  success: boolean;
  data?: any;
  message?: string;
}

export class ResolverConfiguracionPaginaProductoUseCase {
  constructor(private readonly repo: ConfiguracionPaginaProductoRepositoryPort) {}

  async execute(producto_id?: number, categoria_id?: number): Promise<Result> {
    try {
      const config = await this.repo.resolveConfig(producto_id, categoria_id);
      return { success: true, data: config ?? DEFAULT_CONFIG };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al resolver configuración' };
    }
  }
}
