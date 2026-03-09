import { ProductPageOptionRepositoryPort } from '@domain/ports/product-page-option.repository.port';
import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';
import { ProductPageOption, ProductPageOptionEntity } from '@domain/entities/product-page-option.entity';

interface CreateOptionInput {
  section_key: string;
  slide_id?: number;
  texto: string;
  texto_secundario?: string;
  texto_terciario?: string;
  texto_cuarto?: string;
  texto_quinto?: string;
  orden?: number;
}

interface Result {
  success: boolean;
  data?: ProductPageOption;
  message?: string;
  error?: string;
}

export class CrearOptionProductPageUseCase {
  constructor(
    private readonly optionRepository: ProductPageOptionRepositoryPort,
    private readonly sectionRepository: ProductPageSectionRepositoryPort
  ) {}

  async execute(input: CreateOptionInput): Promise<Result> {
    try {
      const section = await this.sectionRepository.findBySectionKey(input.section_key);
      if (!section) {
        return { success: false, message: `Sección '${input.section_key}' no encontrada`, error: 'Sección no encontrada' };
      }

      const orden = input.orden ?? await this.optionRepository.getNextOrder(input.section_key, input.slide_id);

      const option = ProductPageOptionEntity.create(
        input.section_key,
        input.texto,
        orden,
        true,
        input.slide_id,
        input.texto_secundario,
        input.texto_terciario,
        input.texto_cuarto,
        input.texto_quinto
      );

      const created = await this.optionRepository.save(option);
      return { success: true, data: created };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear la opción',
        error: error.message
      };
    }
  }
}
