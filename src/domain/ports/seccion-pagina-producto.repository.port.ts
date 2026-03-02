import { SeccionPaginaProducto } from '@domain/entities/seccion-pagina-producto.entity';

export interface SeccionPaginaProductoRepositoryPort {
  findByConfigId(configId: number): Promise<SeccionPaginaProducto[]>;
  findById(id: number): Promise<SeccionPaginaProducto | null>;
  save(seccion: SeccionPaginaProducto): Promise<SeccionPaginaProducto>;
  update(id: number, data: Partial<SeccionPaginaProducto>): Promise<SeccionPaginaProducto | null>;
  delete(id: number): Promise<void>;
  reorder(configId: number, sectionIds: number[]): Promise<void>;
  getNextOrder(configId: number): Promise<number>;
  toggle(id: number): Promise<SeccionPaginaProducto | null>;
}
