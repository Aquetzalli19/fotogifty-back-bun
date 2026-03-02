import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';
import { CaracteristicaRepositoryPort } from '@domain/ports/caracteristica.repository.port';

interface Result {
  success: boolean;
  message?: string;
  notFound?: boolean;
}

export class ReordenarCaracteristicasUseCase {
  constructor(
    private readonly seccionRepo: SeccionPaginaProductoRepositoryPort,
    private readonly caracteristicaRepo: CaracteristicaRepositoryPort
  ) {}

  async execute(configId: number, sectionId: number, ids: number[]): Promise<Result> {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        return { success: false, message: 'Se requiere un array de IDs de características' };
      }

      const seccion = await this.seccionRepo.findById(sectionId);
      if (!seccion) {
        return { success: false, message: 'Sección no encontrada', notFound: true };
      }

      if (seccion.config_id !== configId) {
        return { success: false, message: 'La sección no pertenece a esta configuración', notFound: true };
      }

      const caracteristicas = await this.caracteristicaRepo.findBySeccionId(sectionId);
      const validIds = new Set(caracteristicas.map((c) => c.id));

      for (const id of ids) {
        if (!validIds.has(id)) {
          return {
            success: false,
            message: `La característica con ID ${id} no pertenece a esta sección`,
          };
        }
      }

      await this.caracteristicaRepo.reorder(sectionId, ids);
      return { success: true, message: 'Características reordenadas exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al reordenar características' };
    }
  }
}
