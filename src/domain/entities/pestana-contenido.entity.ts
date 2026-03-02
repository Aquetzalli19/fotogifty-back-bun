export interface PestanaContenido {
  id?: number;
  seccion_id: number;
  titulo: string;
  contenido: string;
  orden: number;
  activo: boolean;
  usar_datos_producto: boolean;
  campo_datos_producto?: string | null;
}

export class PestanaContenidoEntity implements PestanaContenido {
  public id?: number;
  public seccion_id: number;
  public titulo: string;
  public contenido: string;
  public orden: number;
  public activo: boolean;
  public usar_datos_producto: boolean;
  public campo_datos_producto?: string | null;

  constructor(
    seccion_id: number,
    titulo: string,
    contenido: string = '',
    orden: number = 0,
    activo: boolean = true,
    usar_datos_producto: boolean = false,
    campo_datos_producto?: string | null,
    id?: number
  ) {
    this.seccion_id = seccion_id;
    this.titulo = titulo;
    this.contenido = contenido;
    this.orden = orden;
    this.activo = activo;
    this.usar_datos_producto = usar_datos_producto;
    this.campo_datos_producto = campo_datos_producto;
    this.id = id;
  }

  static create(
    seccion_id: number,
    titulo: string,
    contenido: string = '',
    orden: number = 0,
    activo: boolean = true,
    usar_datos_producto: boolean = false,
    campo_datos_producto?: string | null
  ): PestanaContenidoEntity {
    return new PestanaContenidoEntity(
      seccion_id,
      titulo,
      contenido,
      orden,
      activo,
      usar_datos_producto,
      campo_datos_producto
    );
  }
}
