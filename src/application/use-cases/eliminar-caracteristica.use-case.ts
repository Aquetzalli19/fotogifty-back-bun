import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';
import { CaracteristicaRepositoryPort } from '@domain/ports/caracteristica.repository.port';

interface Result {
  success: boolean;
  message?: string;
  notFound?: boolean;
}

export class EliminarCaracteristicaUseCase {
  constructor(
    private readonly seccionRepo: SeccionPaginaProductoRepositoryPort,
    private readonly caracteristicaRepo: CaracteristicaRepositoryPort
  ) {}

  async execute(configId: number, sectionId: number, caracteristicaId: number): Promise<Result> {
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

      await this.caracteristicaRepo.delete(caracteristicaId);
      return { success: true, message: 'Característica eliminada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al eliminar característica' };
    }
  }
}
