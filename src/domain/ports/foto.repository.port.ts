import { Foto } from '../entities/foto.entity';

export interface FotoRepositoryPort {
  save(foto: Foto): Promise<Foto>;
  findById(id: number): Promise<Foto | null>;
  findByUsuarioId(usuarioId: number): Promise<Foto[]>;
}
