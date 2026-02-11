export interface Paquete {
  id?: number;
  nombre: string;
  categoria_id?: number;
  categoria_nombre?: string;
  descripcion?: string;
  cantidad_fotos: number;
  precio: number;
  estado: boolean;
  resolucion_foto?: number;
  ancho_foto?: number;
  alto_foto?: number;
  imagen_url?: string;
  template_url?: string;
  templates_calendario?: Record<string, string>;
}

export class PaqueteEntity implements Paquete {
  public id?: number;
  public nombre: string;
  public categoria_id?: number;
  public categoria_nombre?: string;
  public descripcion?: string;
  public cantidad_fotos: number;
  public precio: number;
  public estado: boolean;
  public resolucion_foto?: number;
  public ancho_foto?: number;
  public alto_foto?: number;
  public imagen_url?: string;
  public template_url?: string;
  public templates_calendario?: Record<string, string>;

  constructor(
    nombre: string,
    cantidad_fotos: number,
    precio: number,
    estado: boolean,
    categoria_id?: number,
    descripcion?: string,
    resolucion_foto?: number,
    ancho_foto?: number,
    alto_foto?: number,
    imagen_url?: string,
    template_url?: string,
    templates_calendario?: Record<string, string>,
    id?: number
  ) {
    this.id = id;
    this.nombre = nombre;
    this.categoria_id = categoria_id;
    this.descripcion = descripcion;
    this.cantidad_fotos = cantidad_fotos;
    this.precio = precio;
    this.estado = estado;
    this.resolucion_foto = resolucion_foto;
    this.ancho_foto = ancho_foto;
    this.alto_foto = alto_foto;
    this.imagen_url = imagen_url;
    this.template_url = template_url;
    this.templates_calendario = templates_calendario;
  }

  static create(
    nombre: string,
    cantidad_fotos: number,
    precio: number,
    estado: boolean,
    categoria_id?: number,
    descripcion?: string,
    resolucion_foto?: number,
    ancho_foto?: number,
    alto_foto?: number,
    imagen_url?: string,
    template_url?: string,
    templates_calendario?: Record<string, string>
  ): PaqueteEntity {
    return new PaqueteEntity(
      nombre,
      cantidad_fotos,
      precio,
      estado,
      categoria_id,
      descripcion,
      resolucion_foto,
      ancho_foto,
      alto_foto,
      imagen_url,
      template_url,
      templates_calendario
    );
  }
}