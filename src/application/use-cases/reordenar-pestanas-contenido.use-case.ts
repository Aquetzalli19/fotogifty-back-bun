import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';
import { PestanaContenidoRepositoryPort } from '@domain/ports/pestana-contenido.repository.port';

interface Result {
  success: boolean;
  message?: string;
  notFound?: boolean;
}

export class ReordenarPestanasContenidoUseCase {
  constructor(
    private readonly seccionRepo: SeccionPaginaProductoRepositoryPort,
    private readonly pestanaRepo: PestanaContenidoRepositoryPort
  ) {}

  async execute(configId: number, sectionId: number, pestanaIds: number[]): Promise<Result> {
    try {
      if (!Array.isArray(pestanaIds) || pestanaIds.length === 0) {
        return { success: false, message: 'Se requiere un array de IDs de pestañas' };
      }

      const seccion = await this.seccionRepo.findById(sectionId);
      if (!seccion) {
        return { success: false, message: 'Sección no encontrada', notFound: true };
      }

      if (seccion.config_id !== configId) {
        return { success: false, message: 'La sección no pertenece a esta configuración', notFound: true };
      }

      const pestanas = await this.pestanaRepo.findBySeccionId(sectionId);
      const validIds = new Set(pestanas.map((p) => p.id));

      for (const id of pestanaIds) {
        if (!validIds.has(id)) {
          return {
            success: false,
            message: `La pestaña con ID ${id} no pertenece a esta sección`,
          };
        }
      }

      await this.pestanaRepo.reorder(sectionId, pestanaIds);
      return { success: true, message: 'Pestañas reordenadas exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al reordenar pestañas' };
    }
  }
}
