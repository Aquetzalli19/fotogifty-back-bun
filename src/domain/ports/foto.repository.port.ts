import { Foto } from '../entities/foto.entity';

export interface FotoRepositoryPort {
  save(foto: Foto): Promise<Foto>;
  findById(id: number): Promise<Foto | null>;
  findByUsuarioId(usuarioId: number): Promise<Foto[]>;
  getTotalCopiasUsadas(itemPedidoId: number): Promise<number>;
  updateCantidadCopias(id: number, cantidadCopias: number): Promise<Foto | null>;
  findByItemPedidoId(itemPedidoId: number): Promise<Foto[]>;
}
