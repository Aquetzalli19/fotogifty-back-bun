import { PestanaContenido } from '@domain/entities/pestana-contenido.entity';

export interface PestanaContenidoRepositoryPort {
  findBySeccionId(seccionId: number): Promise<PestanaContenido[]>;
  findById(id: number): Promise<PestanaContenido | null>;
  save(pestana: PestanaContenido): Promise<PestanaContenido>;
  update(id: number, data: Partial<PestanaContenido>): Promise<PestanaContenido | null>;
  delete(id: number): Promise<void>;
  reorder(seccionId: number, ids: number[]): Promise<void>;
  getNextOrder(seccionId: number): Promise<number>;
}
