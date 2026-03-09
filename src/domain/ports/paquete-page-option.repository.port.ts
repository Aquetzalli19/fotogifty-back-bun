import { PaquetePageOption } from '../entities/paquete-page-option.entity';

export interface PaquetePageOptionRepositoryPort {
  findById(id: number): Promise<PaquetePageOption | null>;
  findByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<PaquetePageOption[]>;
  findBySlideId(slideId: number): Promise<PaquetePageOption[]>;
  save(option: PaquetePageOption): Promise<PaquetePageOption>;
  saveMany(options: Omit<PaquetePageOption, 'id' | 'created_at' | 'updated_at'>[]): Promise<void>;
  update(id: number, data: Partial<PaquetePageOption>): Promise<PaquetePageOption | null>;
  delete(id: number): Promise<boolean>;
  deleteByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<void>;
  getNextOrder(paqueteId: number, sectionKey: string, slideId?: number): Promise<number>;
  reorder(paqueteId: number, sectionKey: string, optionIds: number[]): Promise<void>;
}
