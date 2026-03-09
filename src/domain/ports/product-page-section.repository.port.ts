import { ProductPageSection } from '../entities/product-page-section.entity';

export interface ProductPageSectionRepositoryPort {
  findAll(): Promise<ProductPageSection[]>;
  findBySectionKey(sectionKey: string): Promise<ProductPageSection | null>;
  update(sectionKey: string, data: Partial<ProductPageSection>): Promise<ProductPageSection | null>;
  save(section: ProductPageSection): Promise<ProductPageSection>;
}
