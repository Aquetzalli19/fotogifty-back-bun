import { Paquete } from '../entities/paquete.entity';

export interface PaqueteRepositoryPort {
  findById(id: number): Promise<Paquete | null>;
  save(paquete: Paquete): Promise<Paquete>;
  findByCategoriaId(categoriaId: number): Promise<Paquete[]>;
  findAll(estado?: boolean): Promise<Paquete[]>;
  update(paquete: Paquete): Promise<Paquete>;
  delete(id: number): Promise<boolean>;
}