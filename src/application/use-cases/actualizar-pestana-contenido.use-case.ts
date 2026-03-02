import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';
import { PestanaContenidoRepositoryPort } from '@domain/ports/pestana-contenido.repository.port';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
  notFound?: boolean;
}

export class ActualizarPestanaContenidoUseCase {
  constructor(
    private readonly seccionRepo: SeccionPaginaProductoRepositoryPort,
    private readonly pestanaRepo: PestanaContenidoRepositoryPort
  ) {}

  async execute(
    configId: number,
    sectionId: number,
    pestanaId: number,
    data: Record<string, any>
  ): Promise<Result> {
    try {
      const pestana = await this.pestanaRepo.findById(pestanaId);
      if (!pestana) {
        return { success: false, message: 'Pestaña no encontrada', notFound: true };
      }

      if (pestana.seccion_id !== sectionId) {
        return { success: false, message: 'La pestaña no pertenece a esta sección', notFound: true };
      }

      const seccion = await this.seccionRepo.findById(sectionId);
      if (!seccion || seccion.config_id !== configId) {
        return { success: false, message: 'La sección no pertenece a esta configuración', notFound: true };
      }

      const updated = await this.pestanaRepo.update(pestanaId, data);
      if (!updated) {
        return { success: false, message: 'Error al actualizar la pestaña' };
      }

      return { success: true, data: updated, message: 'Pestaña actualizada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al actualizar pestaña' };
    }
  }
}
