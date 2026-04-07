import { ProductPageSlideRepositoryPort } from '@domain/ports/product-page-slide.repository.port';
import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';
import { ProductPageSlide, ProductPageSlideEntity } from '@domain/entities/product-page-slide.entity';

interface CreateSlideInput {
  section_key: string;
  tipo: string;
  titulo?: string;
  descripcion?: string;
  imagen_url?: string;
  icono?: string;
  paquete_link_id?: number | null;
  orden?: number;
}

interface Result {
  success: boolean;
  data?: ProductPageSlide;
  message?: string;
  error?: string;
}

export class CrearSlideProductPageUseCase {
  constructor(
    private readonly slideRepository: ProductPageSlideRepositoryPort,
    private readonly sectionRepository: ProductPageSectionRepositoryPort
  ) {}

  async execute(input: CreateSlideInput): Promise<Result> {
    try {
      const section = await this.sectionRepository.findBySectionKey(input.section_key);
      if (!section) {
        return { success: false, message: `Sección '${input.section_key}' no encontrada`, error: 'Sección no encontrada' };
      }

      const orden = input.orden ?? await this.slideRepository.getNextOrder(input.section_key);

      const slide = ProductPageSlideEntity.create(
        input.section_key,
        input.tipo,
        orden,
        true,
        input.titulo,
        input.descripcion,
        input.imagen_url,
        input.icono,
        input.paquete_link_id
      );

      const created = await this.slideRepository.save(slide);
      return { success: true, data: created };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear el slide',
        error: error.message
      };
    }
  }
}
