import { SocialLink } from '../entities/social-link.entity';

export interface SocialLinkRepositoryPort {
  findById(id: number): Promise<SocialLink | null>;
  findByFooterConfigId(footerConfigId: number): Promise<SocialLink[]>;
  findActiveByFooterConfigId(footerConfigId: number): Promise<SocialLink[]>;
  save(link: SocialLink): Promise<SocialLink>;
  update(id: number, data: Partial<SocialLink>): Promise<SocialLink | null>;
  delete(id: number): Promise<boolean>;
  updateOrden(updates: { id: number; orden: number }[]): Promise<void>;
}
