export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion?: Date;
}

export class CategoriaEntity implements Categoria {
  public id?: number;
  public nombre: string;
  public descripcion?: string;
  public activo: boolean;
  public fecha_creacion: Date;

  constructor(nombre: string, activo: boolean, descripcion?: string, id?: number) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.activo = activo;
    this.fecha_creacion = new Date();
  }

  static create(nombre: string, activo: boolean, descripcion?: string): CategoriaEntity {
    return new CategoriaEntity(nombre, activo, descripcion);
  }
}