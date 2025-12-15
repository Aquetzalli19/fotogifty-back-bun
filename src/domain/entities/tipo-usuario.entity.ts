import { Usuario } from './usuario.entity';

export enum TipoUsuario {
  CLIENTE = 'cliente',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  VENDEDOR_VENTANILLA = 'vendedor_ventanilla'
}

export interface UsuarioConTipo extends Usuario {
  tipo: TipoUsuario;
}