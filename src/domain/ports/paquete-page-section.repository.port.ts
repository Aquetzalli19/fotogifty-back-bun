import { PaquetePageSection } from '../entities/paquete-page-section.entity';

export interface PaquetePageSectionRepositoryPort {
  findByPaqueteId(paqueteId: number): Promise<PaquetePageSection[]>;
  findByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<PaquetePageSection | null>;
  upsert(paqueteId: number, sectionKey: string, data: Partial<PaquetePageSection>): Promise<PaquetePageSection>;
  deleteByPaqueteIdAndSectionKey(paqueteId: number, sectionKey: string): Promise<boolean>;
}
