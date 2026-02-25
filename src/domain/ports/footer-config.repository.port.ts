import { FooterConfig } from '../entities/footer-config.entity';

export interface FooterConfigRepositoryPort {
  findFirst(): Promise<FooterConfig | null>;
  update(data: Partial<FooterConfig>): Promise<FooterConfig | null>;
  save(config: FooterConfig): Promise<FooterConfig>;
}
