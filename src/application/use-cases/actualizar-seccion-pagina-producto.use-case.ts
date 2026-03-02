import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';
import { TIPOS_SECCION_VALIDOS } from '@domain/entities/seccion-pagina-producto.entity';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
  notFound?: boolean;
}

export class ActualizarSeccionPaginaProductoUseCase {
  constructor(private readonly seccionRepo: SeccionPaginaProductoRepositoryPort) {}

  async execute(
    configId: number,
    sectionId: number,
    data: Record<string, any>
  ): Promise<Result> {
    try {
      const seccion = await this.seccionRepo.findById(sectionId);
      if (!seccion) {
        return { success: false, message: 'Sección no encontrada', notFound: true };
      }

      if (seccion.config_id !== configId) {
        return { success: false, message: 'La sección no pertenece a esta configuración', notFound: true };
      }

      if (data.tipo !== undefined && !TIPOS_SECCION_VALIDOS.includes(data.tipo as any)) {
        return {
          success: false,
          message: `El tipo debe ser uno de: ${TIPOS_SECCION_VALIDOS.join(', ')}`,
        };
      }

      const updated = await this.seccionRepo.update(sectionId, data);
      if (!updated) {
        return { success: false, message: 'Error al actualizar la sección' };
      }

      return { success: true, data: updated, message: 'Sección actualizada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al actualizar sección' };
    }
  }
}
