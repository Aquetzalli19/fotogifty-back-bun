import { SocialLink } from './social-link.entity';

export interface FooterConfig {
  id?: number;
  descripcion?: string;
  email?: string;
  telefono?: string;
  created_at?: Date;
  updated_at?: Date;
  socialLinks?: SocialLink[];
}

export class FooterConfigEntity implements FooterConfig {
  public id?: number;
  public descripcion?: string;
  public email?: string;
  public telefono?: string;
  public created_at?: Date;
  public updated_at?: Date;
  public socialLinks?: SocialLink[];

  constructor(
    descripcion?: string,
    email?: string,
    telefono?: string,
    id?: number,
    created_at?: Date,
    updated_at?: Date,
    socialLinks?: SocialLink[]
  ) {
    this.id = id;
    this.descripcion = descripcion;
    this.email = email;
    this.telefono = telefono;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.socialLinks = socialLinks || [];
  }

  static create(
    descripcion?: string,
    email?: string,
    telefono?: string,
    socialLinks?: SocialLink[]
  ): FooterConfigEntity {
    return new FooterConfigEntity(
      descripcion,
      email,
      telefono,
      undefined,
      undefined,
      undefined,
      socialLinks
    );
  }
}
