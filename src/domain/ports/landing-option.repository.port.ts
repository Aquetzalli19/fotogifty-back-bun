import { LandingOption } from '../entities/landing-option.entity';

export interface LandingOptionRepositoryPort {
  findById(id: number): Promise<LandingOption | null>;
  findBySectionKey(sectionKey: string): Promise<LandingOption[]>;
  save(option: LandingOption): Promise<LandingOption>;
  update(id: number, data: Partial<LandingOption>): Promise<LandingOption | null>;
  delete(id: number): Promise<boolean>;
  getNextOrder(sectionKey: string): Promise<number>;
  reorder(sectionKey: string, optionIds: number[]): Promise<void>;
}
