import { PaquetePredefinido } from '../entities/paquete.entity';

export interface PaqueteRepository {
  crearPaquete(data: Omit<PaquetePredefinido, 'id'>): Promise<PaquetePredefinido>;
  obtenerPaquetes(): Promise<PaquetePredefinido[]>;
  obtenerPaquetePorId(id: number): Promise<PaquetePredefinido | null>;
  actualizarPaquete(id: number, data: Partial<Omit<PaquetePredefinido, 'id'>>): Promise<PaquetePredefinido>;
  eliminarPaquete(id: number): Promise<boolean>;
}