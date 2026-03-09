import { PaquetePageSlide } from '../entities/paquete-page-slide.entity';

export interface PaquetePageSlideRepositoryPort {
  findById(id: number): Promise<PaquetePageSlide | null>;
  findByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<PaquetePageSlide[]>;
  save(slide: PaquetePageSlide): Promise<PaquetePageSlide>;
  saveMany(slides: Omit<PaquetePageSlide, 'id' | 'created_at' | 'updated_at'>[]): Promise<PaquetePageSlide[]>;
  update(id: number, data: Partial<PaquetePageSlide>): Promise<PaquetePageSlide | null>;
  delete(id: number): Promise<boolean>;
  deleteByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<void>;
  getNextOrder(paqueteId: number, sectionKey: string): Promise<number>;
  reorder(paqueteId: number, sectionKey: string, slideIds: number[]): Promise<void>;
}
