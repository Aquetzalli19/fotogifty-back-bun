import { PaquetePageSection } from '@domain/entities/paquete-page-section.entity';
import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';
import { PaquetePageOptionRepositoryPort } from '@domain/ports/paquete-page-option.repository.port';

export async function buildPaqueteSectionWithRelations(
  section: PaquetePageSection,
  slideRepository: PaquetePageSlideRepositoryPort,
  optionRepository: PaquetePageOptionRepositoryPort
): Promise<any> {
  const slides = await slideRepository.findByPaqueteIdAndSectionKey(section.paquete_id, section.section_key);
  const allOptions = await optionRepository.findByPaqueteIdAndSectionKey(section.paquete_id, section.section_key);

  const sectionOptions = allOptions.filter(o => o.slide_id === undefined || o.slide_id === null);
  const slidesWithOptions = slides.map(slide => ({
    ...slide,
    options: allOptions.filter(o => o.slide_id === slide.id)
  }));

  return { ...section, slides: slidesWithOptions, options: sectionOptions };
}
