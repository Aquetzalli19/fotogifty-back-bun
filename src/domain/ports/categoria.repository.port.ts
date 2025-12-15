import { Categoria } from '../entities/categoria.entity';

export interface CategoriaRepositoryPort {
  findById(id: number): Promise<Categoria | null>;
  save(categoria: Categoria): Promise<Categoria>;
  findAll(): Promise<Categoria[]>;
  update(categoria: Categoria): Promise<Categoria>;
  delete(id: number): Promise<boolean>;
}