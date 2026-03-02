import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';

interface Result {
  success: boolean;
  message?: string;
}

export class ReordenarSeccionesPaginaProductoUseCase {
  constructor(private readonly seccionRepo: SeccionPaginaProductoRepositoryPort) {}

  async execute(configId: number, sectionIds: number[]): Promise<Result> {
    try {
      if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
        return { success: false, message: 'Se requiere un array de IDs de secciones' };
      }

      // Validate all sections belong to this config
      const secciones = await this.seccionRepo.findByConfigId(configId);
      const validIds = new Set(secciones.map((s) => s.id));

      for (const id of sectionIds) {
        if (!validIds.has(id)) {
          return {
            success: false,
            message: `La sección con ID ${id} no pertenece a esta configuración`,
          };
        }
      }

      await this.seccionRepo.reorder(configId, sectionIds);
      return { success: true, message: 'Secciones reordenadas exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al reordenar secciones' };
    }
  }
}
