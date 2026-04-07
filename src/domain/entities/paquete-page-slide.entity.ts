export interface PaquetePageSlide {
  id?: number;
  paquete_id: number;
  section_key: string;
  tipo: string;
  titulo?: string;
  descripcion?: string;
  imagen_url?: string;
  icono?: string;
  paquete_link_id?: number | null;
  orden: number;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class PaquetePageSlideEntity implements PaquetePageSlide {
  public id?: number;
  public paquete_id: number;
  public section_key: string;
  public tipo: string;
  public titulo?: string;
  public descripcion?: string;
  public imagen_url?: string;
  public icono?: string;
  public paquete_link_id?: number | null;
  public orden: number;
  public activo: boolean;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(
    paquete_id: number,
    section_key: string,
    tipo: string,
    orden: number = 0,
    activo: boolean = true,
    titulo?: string,
    descripcion?: string,
    imagen_url?: string,
    icono?: string,
    id?: number,
    created_at?: Date,
    updated_at?: Date,
    paquete_link_id?: number | null
  ) {
    this.id = id;
    this.paquete_id = paquete_id;
    this.section_key = section_key;
    this.tipo = tipo;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.imagen_url = imagen_url;
    this.icono = icono;
    this.paquete_link_id = paquete_link_id;
    this.orden = orden;
    this.activo = activo;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }
}
