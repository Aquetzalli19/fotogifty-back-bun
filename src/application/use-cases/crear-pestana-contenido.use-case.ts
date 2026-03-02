import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';
import { PestanaContenidoRepositoryPort } from '@domain/ports/pestana-contenido.repository.port';
import { PestanaContenidoEntity } from '@domain/entities/pestana-contenido.entity';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
  notFound?: boolean;
}

export class CrearPestanaContenidoUseCase {
  constructor(
    private readonly seccionRepo: SeccionPaginaProductoRepositoryPort,
    private readonly pestanaRepo: PestanaContenidoRepositoryPort
  ) {}

  async execute(
    configId: number,
    sectionId: number,
    titulo: string,
    contenido: string = '',
    activo: boolean = true,
    usar_datos_producto: boolean = false,
    campo_datos_producto?: string | null
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

      const orden = await this.pestanaRepo.getNextOrder(sectionId);

      const pestana = PestanaContenidoEntity.create(
        sectionId,
        titulo,
        contenido,
        orden,
        activo,
        usar_datos_producto,
        campo_datos_producto
      );

      const saved = await this.pestanaRepo.save(pestana);
      return { success: true, data: saved, message: 'Pestaña creada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al crear pestaña' };
    }
  }
}
