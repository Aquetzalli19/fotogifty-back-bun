import { ProductPageSlide } from '../entities/product-page-slide.entity';

export interface ProductPageSlideRepositoryPort {
  findById(id: number): Promise<ProductPageSlide | null>;
  findBySectionKey(sectionKey: string): Promise<ProductPageSlide[]>;
  save(slide: ProductPageSlide): Promise<ProductPageSlide>;
  update(id: number, data: Partial<ProductPageSlide>): Promise<ProductPageSlide | null>;
  delete(id: number): Promise<boolean>;
  getNextOrder(sectionKey: string): Promise<number>;
  reorder(sectionKey: string, slideIds: number[]): Promise<void>;
}
