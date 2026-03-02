import { Caracteristica } from '@domain/entities/caracteristica.entity';

export interface CaracteristicaRepositoryPort {
  findBySeccionId(seccionId: number): Promise<Caracteristica[]>;
  findById(id: number): Promise<Caracteristica | null>;
  save(c: Caracteristica): Promise<Caracteristica>;
  update(id: number, data: Partial<Caracteristica>): Promise<Caracteristica | null>;
  delete(id: number): Promise<void>;
  reorder(seccionId: number, ids: number[]): Promise<void>;
  getNextOrder(seccionId: number): Promise<number>;
}
