export interface PaquetePredefinido {
  id?: number;
  categoria_id?: number;
  tipo_paquete_id: number;
  nombre: string;
  descripcion?: string;
  cantidad_fotos: number;
  precio: number;
  resolucion_foto: number;
  ancho_foto: number;
  alto_foto: number;
  estado: boolean;
}

export class PaquetePredefinidoEntity implements PaquetePredefinido {
  public id?: number;
  public categoria_id?: number;
  public tipo_paquete_id: number;
  public nombre: string;
  public descripcion?: string;
  public cantidad_fotos: number;
  public precio: number;
  public resolucion_foto: number;
  public ancho_foto: number;
  public alto_foto: number;
  public estado: boolean;

  constructor(
    categoria_id: number | undefined,
    tipo_paquete_id: number,
    nombre: string,
    descripcion: string | undefined,
    cantidad_fotos: number,
    precio: number,
    resolucion_foto: number,
    ancho_foto: number,
    alto_foto: number,
    estado: boolean,
    id?: number
  ) {
    this.id = id;
    this.categoria_id = categoria_id;
    this.tipo_paquete_id = tipo_paquete_id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.cantidad_fotos = cantidad_fotos;
    this.precio = precio;
    this.resolucion_foto = resolucion_foto;
    this.ancho_foto = ancho_foto;
    this.alto_foto = alto_foto;
    this.estado = estado;
  }

  static create(
    categoria_id: number | undefined,
    tipo_paquete_id: number,
    nombre: string,
    descripcion: string | undefined,
    cantidad_fotos: number,
    precio: number,
    resolucion_foto: number,
    ancho_foto: number,
    alto_foto: number,
    estado: boolean
  ): PaquetePredefinidoEntity {
    return new PaquetePredefinidoEntity(
      categoria_id,
      tipo_paquete_id,
      nombre,
      descripcion,
      cantidad_fotos,
      precio,
      resolucion_foto,
      ancho_foto,
      alto_foto,
      estado
    );
  }
}