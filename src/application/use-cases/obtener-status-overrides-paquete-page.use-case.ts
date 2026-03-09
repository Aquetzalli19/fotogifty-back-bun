import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';

const SECTION_KEYS = ['gallery', 'why_choose', 'paper_types', 'print_services', 'product_types', 'sizes_table'];

interface Result { success: boolean; data?: { section_key: string; has_override: boolean }[]; message?: string; error?: string; }

export class ObtenerStatusOverridesPaquetePageUseCase {
  constructor(private readonly sectionRepository: PaquetePageSectionRepositoryPort) {}

  async execute(paqueteId: number): Promise<Result> {
    try {
      const existing = await this.sectionRepository.findByPaqueteId(paqueteId);
      const existingKeys = new Set(existing.map(s => s.section_key));
      const data = SECTION_KEYS.map(section_key => ({
        section_key,
        has_override: existingKeys.has(section_key)
      }));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener el estado de overrides', error: error.message };
    }
  }
}
