import { ConfiguracionPaginaProductoRepositoryPort } from '@domain/ports/configuracion-pagina-producto.repository.port';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
  notFound?: boolean;
}

export class ObtenerConfiguracionPaginaProductoUseCase {
  constructor(private readonly repo: ConfiguracionPaginaProductoRepositoryPort) {}

  async execute(id: number): Promise<Result> {
    try {
      const config = await this.repo.findByIdWithFullData(id);
      if (!config) {
        return { success: false, message: 'Configuración no encontrada', notFound: true };
      }
      return { success: true, data: config };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener configuración' };
    }
  }
}
