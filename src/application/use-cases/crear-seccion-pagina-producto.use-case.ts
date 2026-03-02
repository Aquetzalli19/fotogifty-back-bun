import { ConfiguracionPaginaProductoRepositoryPort } from '@domain/ports/configuracion-pagina-producto.repository.port';
import { SeccionPaginaProductoRepositoryPort } from '@domain/ports/seccion-pagina-producto.repository.port';
import {
  SeccionPaginaProductoEntity,
  TIPOS_SECCION_VALIDOS,
} from '@domain/entities/seccion-pagina-producto.entity';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
  notFound?: boolean;
}

export class CrearSeccionPaginaProductoUseCase {
  constructor(
    private readonly configRepo: ConfiguracionPaginaProductoRepositoryPort,
    private readonly seccionRepo: SeccionPaginaProductoRepositoryPort
  ) {}

  async execute(
    configId: number,
    tipo: string,
    titulo?: string | null,
    activo: boolean = true,
    estilo?: Record<string, any> | null,
    configuracion?: Record<string, any> | null
  ): Promise<Result> {
    try {
      const config = await this.configRepo.findById(configId);
      if (!config) {
        return { success: false, message: 'Configuración no encontrada', notFound: true };
      }

      if (!tipo || !TIPOS_SECCION_VALIDOS.includes(tipo as any)) {
        return {
          success: false,
          message: `El tipo debe ser uno de: ${TIPOS_SECCION_VALIDOS.join(', ')}`,
        };
      }

      const orden = await this.seccionRepo.getNextOrder(configId);

      const seccion = SeccionPaginaProductoEntity.create(
        configId,
        tipo,
        orden,
        activo,
        titulo,
        estilo,
        configuracion
      );

      const saved = await this.seccionRepo.save(seccion);
      return { success: true, data: saved, message: 'Sección creada exitosamente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al crear sección' };
    }
  }
}
