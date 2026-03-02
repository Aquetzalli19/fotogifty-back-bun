import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';
import { CaracteristicaRepositoryPort } from '@domain/ports/caracteristica.repository.port';
import { CaracteristicaEntity } from '@domain/entities/caracteristica.entity';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
  notFound?: boolean;
}

export class CrearCaracteristicaUseCase {
  constructor(
    private readonly seccionRepo: SeccionPaginaProductoRepositoryPort,
    private readonly caracteristicaRepo: CaracteristicaRepositoryPort
  ) {}

  async execute(
    configId: number,
    sectionId: number,
    titulo: string,
    descripcion: string = '',
    icono: string = 'Check',
    activo: boolean = true
  ): Promise<Result> {
    try {
      if (!titulo || typeof titulo !== 'string') {
        return { success: false, message: 'El título es requerido' };
      }

      const seccion = await this.seccionRepo.findById(sectionId);
      if (!seccion) {
        return { success: false, message: 'Sección no encontrada', notFound: true };
      }

      if (seccion.config_id !== configId) {
        return { success: false, message: 'La sección no pertenece a esta configuración', notFound: true };
      }

      const orden = await this.caracteristicaRepo.getNextOrder(sectionId);

      const caracteristica = CaracteristicaEntity.create(
        sectionId,
        titulo,
        descripcion,
        icono,
        orden,
        activo
      );

      const saved = await this.caracteristicaRepo.save(caracteristica);
      return { success: true, data: saved, message: 'Característica creada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al crear característica' };
    }
  }
}
