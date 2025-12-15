import { TipoUsuario } from './tipo-usuario.entity';

export interface Usuario {
  id?: number;
  email: string;
  password_hash: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fecha_registro?: Date;
  activo?: boolean;
  tipo?: TipoUsuario;
}

export class UsuarioEntity implements Usuario {
  public id?: number;
  public email: string;
  public password_hash: string;
  public nombre: string;
  public apellido: string;
  public telefono?: string;
  public fecha_registro: Date;
  public activo: boolean;
  public tipo?: TipoUsuario;

  constructor(
    email: string,
    password_hash: string,
    nombre: string,
    apellido: string,
    tipo?: TipoUsuario,
    telefono?: string,
    id?: number
  ) {
    this.id = id;
    this.email = email;
    this.password_hash = password_hash;
    this.nombre = nombre;
    this.apellido = apellido;
    this.telefono = telefono;
    this.fecha_registro = new Date();
    this.activo = true;
    this.tipo = tipo;
  }

  static create(
    email: string,
    password_hash: string,
    nombre: string,
    apellido: string,
    tipo?: TipoUsuario,
    telefono?: string
  ): UsuarioEntity {
    return new UsuarioEntity(email, password_hash, nombre, apellido, tipo, telefono);
  }
}