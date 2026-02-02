import { CarritoTemporal, CarritoTemporalData } from '../entities/carrito-temporal.entity';

export interface CarritoTemporalRepositoryPort {
  findByUsuarioId(usuarioId: number): Promise<CarritoTemporal | null>;
  save(carrito: CarritoTemporal): Promise<CarritoTemporal>;
  update(usuarioId: number, datos: CarritoTemporalData): Promise<CarritoTemporal | null>;
  delete(usuarioId: number): Promise<boolean>;
  deleteOlderThan(days: number): Promise<number>;
}
