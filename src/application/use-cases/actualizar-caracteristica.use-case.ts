import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';
import { CaracteristicaRepositoryPort } from '@domain/ports/caracteristica.repository.port';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
  notFound?: boolean;
}

export class ActualizarCaracteristicaUseCase {
  constructor(
    private readonly seccionRepo: SeccionPaginaProductoRepositoryPort,
    private readonly caracteristicaRepo: CaracteristicaRepositoryPort
  ) {}

  async execute(
    configId: number,
    sectionId: number,
    caracteristicaId: number,
    data: Record<string, any>
  ): Promise<Result> {
    try {
      const caracteristica = await this.caracteristicaRepo.findById(caracteristicaId);
      if (!caracteristica) {
        return { success: false, message: 'Característica no encontrada', notFound: true };
      }

      if (caracteristica.seccion_id !== sectionId) {
        return { success: false, message: 'La característica no pertenece a esta sección', notFound: true };
      }

      const seccion = await this.seccionRepo.findById(sectionId);
      if (!seccion || seccion.config_id !== configId) {
        return { success: false, message: 'La sección no pertenece a esta configuración', notFound: true };
      }

      const updated = await this.caracteristicaRepo.update(caracteristicaId, data);
      if (!updated) {
        return { success: false, message: 'Error al actualizar la característica' };
      }

      return { success: true, data: updated, message: 'Característica actualizada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al actualizar característica' };
    }
  }
}
