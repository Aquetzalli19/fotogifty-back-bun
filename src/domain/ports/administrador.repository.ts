import { Administrador } from '../entities/administrador.entity';

export interface AdministradorRepository {
  crearAdministrador(data: Omit<Administrador, 'id'>): Promise<Administrador>;
  obtenerAdministradorPorId(id: number): Promise<Administrador | null>;
  obtenerAdministradorPorUsuarioId(usuarioId: number): Promise<Administrador | null>;
  actualizarAdministrador(id: number, data: Partial<Omit<Administrador, 'id'>>): Promise<Administrador>;
  eliminarAdministrador(id: number): Promise<boolean>;
}