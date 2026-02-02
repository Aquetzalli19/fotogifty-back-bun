import { LandingSection } from '../entities/landing-section.entity';

export interface LandingSectionRepositoryPort {
  findAll(): Promise<LandingSection[]>;
  findBySectionKey(sectionKey: string): Promise<LandingSection | null>;
  update(sectionKey: string, data: Partial<LandingSection>): Promise<LandingSection | null>;
  save(section: LandingSection): Promise<LandingSection>;
}
