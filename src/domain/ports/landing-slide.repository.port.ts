import { LandingSlide } from '../entities/landing-slide.entity';

export interface LandingSlideRepositoryPort {
  findById(id: number): Promise<LandingSlide | null>;
  findBySectionKey(sectionKey: string): Promise<LandingSlide[]>;
  save(slide: LandingSlide): Promise<LandingSlide>;
  update(id: number, data: Partial<LandingSlide>): Promise<LandingSlide | null>;
  delete(id: number): Promise<boolean>;
  getNextOrder(sectionKey: string): Promise<number>;
  reorder(sectionKey: string, slideIds: number[]): Promise<void>;
}
