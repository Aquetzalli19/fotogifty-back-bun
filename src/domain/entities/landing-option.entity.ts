export interface LandingOption {
  id?: number;
  section_key: string;
  texto: string;
  orden: number;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class LandingOptionEntity implements LandingOption {
  public id?: number;
  public section_key: string;
  public texto: string;
  public orden: number;
  public activo: boolean;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(
    section_key: string,
    texto: string,
    orden: number = 0,
    activo: boolean = true,
    id?: number,
    created_at?: Date,
    updated_at?: Date
  ) {
    this.id = id;
    this.section_key = section_key;
    this.texto = texto;
    this.orden = orden;
    this.activo = activo;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }

  static create(
    section_key: string,
    texto: string,
    orden: number = 0,
    activo: boolean = true
  ): LandingOptionEntity {
    return new LandingOptionEntity(
      section_key,
      texto,
      orden,
      activo,
      undefined
    );
  }
}
