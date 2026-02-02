export interface ImagenTemporal {
  id?: number;
  usuario_id: number;
  s3_key: string;
  s3_url?: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  created_at?: Date;
  expires_at: Date;
}

export class ImagenTemporalEntity implements ImagenTemporal {
  public id?: number;
  public usuario_id: number;
  public s3_key: string;
  public s3_url?: string;
  public original_filename: string;
  public mime_type: string;
  public size_bytes: number;
  public created_at?: Date;
  public expires_at: Date;

  constructor(
    usuario_id: number,
    s3_key: string,
    original_filename: string,
    mime_type: string,
    size_bytes: number,
    expires_at: Date,
    s3_url?: string,
    id?: number,
    created_at?: Date
  ) {
    this.id = id;
    this.usuario_id = usuario_id;
    this.s3_key = s3_key;
    this.s3_url = s3_url;
    this.original_filename = original_filename;
    this.mime_type = mime_type;
    this.size_bytes = size_bytes;
    this.created_at = created_at || new Date();
    this.expires_at = expires_at;
  }

  static create(
    usuario_id: number,
    s3_key: string,
    original_filename: string,
    mime_type: string,
    size_bytes: number,
    daysUntilExpiration: number = 7
  ): ImagenTemporalEntity {
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + daysUntilExpiration);

    return new ImagenTemporalEntity(
      usuario_id,
      s3_key,
      original_filename,
      mime_type,
      size_bytes,
      expires_at,
      undefined,
      undefined
    );
  }
}
