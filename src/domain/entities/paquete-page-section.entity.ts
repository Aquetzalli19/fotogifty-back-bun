export interface PaquetePageSection {
  id?: number;
  paquete_id: number;
  section_key: string;
  titulo?: string;
  subtitulo?: string;
  descripcion?: string;
  imagen_principal_url?: string;
  orden: number;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class PaquetePageSectionEntity implements PaquetePageSection {
  public id?: number;
  public paquete_id: number;
  public section_key: string;
  public titulo?: string;
  public subtitulo?: string;
  public descripcion?: string;
  public imagen_principal_url?: string;
  public orden: number;
  public activo: boolean;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(
    paquete_id: number,
    section_key: string,
    orden: number = 0,
    activo: boolean = true,
    titulo?: string,
    subtitulo?: string,
    descripcion?: string,
    imagen_principal_url?: string,
    id?: number,
    created_at?: Date,
    updated_at?: Date
  ) {
    this.id = id;
    this.paquete_id = paquete_id;
    this.section_key = section_key;
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.descripcion = descripcion;
    this.imagen_principal_url = imagen_principal_url;
    this.orden = orden;
    this.activo = activo;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }
}
