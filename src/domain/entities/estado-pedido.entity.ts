export interface EstadoPedidoDinamico {
  id?: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden: number;
  activo: boolean;
}

export class EstadoPedidoEntity implements EstadoPedidoDinamico {
  public id?: number;
  public nombre: string;
  public descripcion?: string;
  public color?: string;
  public orden: number;
  public activo: boolean;

  constructor(
    nombre: string,
    orden: number = 0,
    activo: boolean = true,
    descripcion?: string,
    color?: string,
    id?: number
  ) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.color = color;
    this.orden = orden;
    this.activo = activo;
  }

  static create(
    nombre: string,
    orden: number = 0,
    descripcion?: string,
    color?: string
  ): EstadoPedidoEntity {
    return new EstadoPedidoEntity(nombre, orden, true, descripcion, color);
  }
}
