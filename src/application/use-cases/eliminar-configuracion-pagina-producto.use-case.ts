import { ConfiguracionPaginaProductoRepositoryPort } from '@domain/ports/configuracion-pagina-producto.repository.port';

interface Result {
  success: boolean;
  message?: string;
  notFound?: boolean;
}

export class EliminarConfiguracionPaginaProductoUseCase {
  constructor(private readonly repo: ConfiguracionPaginaProductoRepositoryPort) {}

  async execute(id: number): Promise<Result> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        return { success: false, message: 'Configuración no encontrada', notFound: true };
      }

      await this.repo.delete(id);
      return { success: true, message: 'Configuración eliminada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al eliminar configuración' };
    }
  }
}
