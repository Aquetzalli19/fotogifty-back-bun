export interface PaquetePageOption {
  id?: number;
  paquete_id: number;
  section_key: string;
  slide_id?: number;
  texto: string;
  texto_secundario?: string;
  texto_terciario?: string;
  texto_cuarto?: string;
  texto_quinto?: string;
  orden: number;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class PaquetePageOptionEntity implements PaquetePageOption {
  public id?: number;
  public paquete_id: number;
  public section_key: string;
  public slide_id?: number;
  public texto: string;
  public texto_secundario?: string;
  public texto_terciario?: string;
  public texto_cuarto?: string;
  public texto_quinto?: string;
  public orden: number;
  public activo: boolean;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(
    paquete_id: number,
    section_key: string,
    texto: string,
    orden: number = 0,
    activo: boolean = true,
    slide_id?: number,
    texto_secundario?: string,
    texto_terciario?: string,
    texto_cuarto?: string,
    texto_quinto?: string,
    id?: number,
    created_at?: Date,
    updated_at?: Date
  ) {
    this.id = id;
    this.paquete_id = paquete_id;
    this.section_key = section_key;
    this.slide_id = slide_id;
    this.texto = texto;
    this.texto_secundario = texto_secundario;
    this.texto_terciario = texto_terciario;
    this.texto_cuarto = texto_cuarto;
    this.texto_quinto = texto_quinto;
    this.orden = orden;
    this.activo = activo;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }
}
