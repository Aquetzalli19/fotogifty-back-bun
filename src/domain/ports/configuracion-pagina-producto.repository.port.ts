import { ConfiguracionPaginaProducto } from '@domain/entities/configuracion-pagina-producto.entity';

export interface ConfiguracionPaginaProductoRepositoryPort {
  findAll(): Promise<ConfiguracionPaginaProducto[]>;
  findById(id: number): Promise<ConfiguracionPaginaProducto | null>;
  findByIdWithFullData(id: number): Promise<ConfiguracionPaginaProducto | null>;
  resolveConfig(producto_id?: number, categoria_id?: number): Promise<ConfiguracionPaginaProducto | null>;
  save(config: ConfiguracionPaginaProducto): Promise<ConfiguracionPaginaProducto>;
  update(id: number, data: Partial<ConfiguracionPaginaProducto>): Promise<ConfiguracionPaginaProducto | null>;
  delete(id: number): Promise<void>;
}
