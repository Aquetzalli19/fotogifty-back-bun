export interface AceptacionTerminos {
  id?: number;
  usuario_id: number;
  documento_legal_id: number;
  version: string;
  fecha_aceptacion?: Date;
  ip_address?: string;
  user_agent?: string;
}

export class AceptacionTerminosEntity implements AceptacionTerminos {
  public id?: number;
  public usuario_id: number;
  public documento_legal_id: number;
  public version: string;
  public fecha_aceptacion: Date;
  public ip_address?: string;
  public user_agent?: string;

  constructor(
    usuario_id: number,
    documento_legal_id: number,
    version: string,
    fecha_aceptacion?: Date,
    ip_address?: string,
    user_agent?: string,
    id?: number
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.documento_legal_id = documento_legal_id;
    this.version = version;
    this.fecha_aceptacion = fecha_aceptacion ?? new Date();
    this.ip_address = ip_address;
    this.user_agent = user_agent;
  }

  static create(
    usuario_id: number,
    documento_legal_id: number,
    version: string,
    ip_address?: string,
    user_agent?: string
  ): AceptacionTerminosEntity {
    return new AceptacionTerminosEntity(
      usuario_id,
      documento_legal_id,
      version,
      new Date(),
      ip_address,
      user_agent
    );
  }
}
