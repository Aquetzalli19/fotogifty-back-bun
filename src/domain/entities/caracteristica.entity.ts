export interface Caracteristica {
  id?: number;
  seccion_id: number;
  titulo: string;
  descripcion: string;
  icono: string;
  orden: number;
  activo: boolean;
}

export class CaracteristicaEntity implements Caracteristica {
  public id?: number;
  public seccion_id: number;
  public titulo: string;
  public descripcion: string;
  public icono: string;
  public orden: number;
  public activo: boolean;

  constructor(
    seccion_id: number,
    titulo: string,
    descripcion: string = '',
    icono: string = 'Check',
    orden: number = 0,
    activo: boolean = true,
    id?: number
  ) {
    this.seccion_id = seccion_id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.icono = icono;
    this.orden = orden;
    this.activo = activo;
    this.id = id;
  }

  static create(
    seccion_id: number,
    titulo: string,
    descripcion: string = '',
    icono: string = 'Check',
    orden: number = 0,
    activo: boolean = true
  ): CaracteristicaEntity {
    return new CaracteristicaEntity(
      seccion_id,
      titulo,
      descripcion,
      icono,
      orden,
      activo
    );
  }
}
