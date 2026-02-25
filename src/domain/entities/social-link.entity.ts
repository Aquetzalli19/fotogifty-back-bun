export type PlataformaSocial = 'instagram' | 'facebook' | 'whatsapp' | 'tiktok' | 'twitter' | 'youtube';

export interface SocialLink {
  id?: number;
  footer_config_id: number;
  plataforma: PlataformaSocial;
  url: string;
  orden: number;
  activo: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class SocialLinkEntity implements SocialLink {
  public id?: number;
  public footer_config_id: number;
  public plataforma: PlataformaSocial;
  public url: string;
  public orden: number;
  public activo: boolean;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(
    footer_config_id: number,
    plataforma: PlataformaSocial,
    url: string,
    orden: number = 0,
    activo: boolean = true,
    id?: number,
    created_at?: Date,
    updated_at?: Date
  ) {
    this.id = id;
    this.footer_config_id = footer_config_id;
    this.plataforma = plataforma;
    this.url = url;
    this.orden = orden;
    this.activo = activo;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }

  static create(
    footer_config_id: number,
    plataforma: PlataformaSocial,
    url: string,
    orden: number = 0,
    activo: boolean = true
  ): SocialLinkEntity {
    return new SocialLinkEntity(
      footer_config_id,
      plataforma,
      url,
      orden,
      activo,
      undefined
    );
  }
}
