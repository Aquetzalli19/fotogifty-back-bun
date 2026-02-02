import { ImagenTemporal } from '../entities/imagen-temporal.entity';

export interface ImagenTemporalRepositoryPort {
  findById(id: number): Promise<ImagenTemporal | null>;
  findByUsuarioId(usuarioId: number): Promise<ImagenTemporal[]>;
  findByS3Key(s3Key: string): Promise<ImagenTemporal | null>;
  save(imagen: ImagenTemporal): Promise<ImagenTemporal>;
  update(id: number, s3_url: string): Promise<ImagenTemporal | null>;
  delete(id: number): Promise<boolean>;
  deleteAllByUsuarioId(usuarioId: number): Promise<number>;
  deleteExpired(): Promise<number>;
}
