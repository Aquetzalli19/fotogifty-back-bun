import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';

interface Result {
  success: boolean;
  message?: string;
  notFound?: boolean;
}

export class EliminarSeccionPaginaProductoUseCase {
  constructor(private readonly seccionRepo: SeccionPaginaProductoRepositoryPort) {}

  async execute(configId: number, sectionId: number): Promise<Result> {
    try {
      const seccion = await this.seccionRepo.findById(sectionId);
      if (!seccion) {
        return { success: false, message: 'Sección no encontrada', notFound: true };
      }

      if (seccion.config_id !== configId) {
        return { success: false, message: 'La sección no pertenece a esta configuración', notFound: true };
      }

      await this.seccionRepo.delete(sectionId);
      return { success: true, message: 'Sección eliminada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al eliminar sección' };
    }
  }
}
