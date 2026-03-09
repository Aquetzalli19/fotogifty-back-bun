import { ProductPageOption } from '../entities/product-page-option.entity';

export interface ProductPageOptionRepositoryPort {
  findById(id: number): Promise<ProductPageOption | null>;
  findBySectionKey(sectionKey: string): Promise<ProductPageOption[]>;
  findBySlideId(slideId: number): Promise<ProductPageOption[]>;
  save(option: ProductPageOption): Promise<ProductPageOption>;
  update(id: number, data: Partial<ProductPageOption>): Promise<ProductPageOption | null>;
  delete(id: number): Promise<boolean>;
  getNextOrder(sectionKey: string, slideId?: number): Promise<number>;
  reorder(sectionKey: string, optionIds: number[]): Promise<void>;
}
