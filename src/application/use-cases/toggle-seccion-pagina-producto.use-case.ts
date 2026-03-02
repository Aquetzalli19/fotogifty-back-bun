import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
  notFound?: boolean;
}

export class ToggleSeccionPaginaProductoUseCase {
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

      const updated = await this.seccionRepo.toggle(sectionId);
      const newActivo = updated?.activo;

      return {
        success: true,
        data: { activo: newActivo },
        message: newActivo ? 'Sección activada' : 'Sección desactivada',
      };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al cambiar estado de sección' };
    }
  }
}
