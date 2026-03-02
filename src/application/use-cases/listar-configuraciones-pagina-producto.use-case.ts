import { ConfiguracionPaginaProductoRepositoryPort } from '@domain/ports/configuracion-pagina-producto.repository.port';

interface Result {
  success: boolean;
  data?: any;
  message?: string;
}

export class ListarConfiguracionesPaginaProductoUseCase {
  constructor(private readonly repo: ConfiguracionPaginaProductoRepositoryPort) {}

  async execute(): Promise<Result> {
    try {
      const configs = await this.repo.findAll();
      return { success: true, data: configs };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al listar configuraciones' };
    }
  }
}
