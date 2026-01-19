export enum TipoDocumentoLegal {
  TERMS = 'terms',
  PRIVACY = 'privacy',
}

export interface DocumentoLegal {
  id?: number;
  tipo: TipoDocumentoLegal;
  titulo: string;
  contenido: string;
  version: string;
  activo: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}

export class DocumentoLegalEntity implements DocumentoLegal {
  public id?: number;
  public tipo: TipoDocumentoLegal;
  public titulo: string;
  public contenido: string;
  public version: string;
  public activo: boolean;
  public fecha_creacion: Date;
  public fecha_actualizacion: Date;

  constructor(
    tipo: TipoDocumentoLegal,
    titulo: string,
    contenido: string,
    version: string,
    activo: boolean = false,
    id?: number,
    fecha_creacion?: Date,
    fecha_actualizacion?: Date
  ) {
    this.id = id;
    this.tipo = tipo;
    this.titulo = titulo;
    this.contenido = contenido;
    this.version = version;
    this.activo = activo;
    this.fecha_creacion = fecha_creacion ?? new Date();
    this.fecha_actualizacion = fecha_actualizacion ?? new Date();
  }

  static create(
    tipo: TipoDocumentoLegal,
    titulo: string,
    contenido: string,
    version: string,
    activo: boolean = false
  ): DocumentoLegalEntity {
    return new DocumentoLegalEntity(
      tipo,
      titulo,
      contenido,
      version,
      activo
    );
  }
}
