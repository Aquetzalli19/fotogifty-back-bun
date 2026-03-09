export interface ProductPageSlide {
  id?: number;
  section_key: string;
  tipo: string;
  titulo?: string;
  descripcion?: string;
  imagen_url?: string;
  icono?: string;
  orden: number;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class ProductPageSlideEntity implements ProductPageSlide {
  public id?: number;
  public section_key: string;
  public tipo: string;
  public titulo?: string;
  public descripcion?: string;
  public imagen_url?: string;
  public icono?: string;
  public orden: number;
  public activo: boolean;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(
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
    updated_at?: Date
  ) {
    this.id = id;
    this.section_key = section_key;
    this.tipo = tipo;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.imagen_url = imagen_url;
    this.icono = icono;
    this.orden = orden;
    this.activo = activo;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }

  static create(
    section_key: string,
    tipo: string,
    orden: number = 0,
    activo: boolean = true,
    titulo?: string,
    descripcion?: string,
    imagen_url?: string,
    icono?: string
  ): ProductPageSlideEntity {
    return new ProductPageSlideEntity(
      section_key,
      tipo,
      orden,
      activo,
      titulo,
      descripcion,
      imagen_url,
      icono,
      undefined
    );
  }
}
