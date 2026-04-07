import { PaquetePageSectionRepositoryPort } from '@domain/ports/paquete-page-section.repository.port';
import { PaquetePageSlideRepositoryPort } from '@domain/ports/paquete-page-slide.repository.port';
import { PaquetePageOptionRepositoryPort } from '@domain/ports/paquete-page-option.repository.port';
import { ProductPageSectionRepositoryPort } from '@domain/ports/product-page-section.repository.port';
import { ProductPageSlideRepositoryPort } from '@domain/ports/product-page-slide.repository.port';
import { ProductPageOptionRepositoryPort } from '@domain/ports/product-page-option.repository.port';
import { buildPaqueteSectionWithRelations } from './helpers/build-paquete-section-with-relations';
import prisma from '@infrastructure/database/prisma.client';

const ALL_SECTION_KEYS = ['gallery', 'why_choose', 'paper_types', 'print_services', 'product_types', 'sizes_table'];

interface Result { success: boolean; data?: any[]; message?: string; error?: string; }

export class ClonarDesdeGlobalPaquetePageUseCase {
  constructor(
    private readonly paqueteSectionRepository: PaquetePageSectionRepositoryPort,
    private readonly paqueteSlideRepository: PaquetePageSlideRepositoryPort,
    private readonly paqueteOptionRepository: PaquetePageOptionRepositoryPort,
    private readonly globalSectionRepository: ProductPageSectionRepositoryPort,
    private readonly globalSlideRepository: ProductPageSlideRepositoryPort,
    private readonly globalOptionRepository: ProductPageOptionRepositoryPort
  ) {}

  async execute(paqueteId: number, sectionKeys?: string[]): Promise<Result> {
    try {
      const paquete = await prisma.paquetes_predefinidos.findUnique({ where: { id: paqueteId } });
      if (!paquete) {
        return { success: false, message: `Paquete ${paqueteId} no encontrado`, error: 'Paquete no encontrado' };
      }

      const keysToClone = sectionKeys && sectionKeys.length > 0 ? sectionKeys : ALL_SECTION_KEYS;
      const clonedSections: any[] = [];

      for (const sectionKey of keysToClone) {
        const globalSection = await this.globalSectionRepository.findBySectionKey(sectionKey);
        if (!globalSection) continue;

        // 1. Reset existing per-product slides and options for this section
        await this.paqueteSlideRepository.deleteByPaqueteIdAndSectionKey(paqueteId, sectionKey);
        await this.paqueteOptionRepository.deleteByPaqueteIdAndSectionKey(paqueteId, sectionKey);

        // 2. Upsert the section override
        await this.paqueteSectionRepository.upsert(paqueteId, sectionKey, {
          titulo: globalSection.titulo,
          subtitulo: globalSection.subtitulo,
          descripcion: globalSection.descripcion,
          imagen_principal_url: globalSection.imagen_principal_url,
          orden: globalSection.orden,
          activo: globalSection.activo
        });

        // 3. Clone slides and build global→per-product ID map
        const globalSlides = await this.globalSlideRepository.findBySectionKey(sectionKey);
        const idMap = new Map<number, number>(); // globalSlideId → newSlideId

        if (globalSlides.length > 0) {
          const slideInputs = globalSlides.map(s => ({
            paquete_id: paqueteId,
            section_key: sectionKey,
            tipo: s.tipo,
            titulo: s.titulo,
            descripcion: s.descripcion,
            imagen_url: s.imagen_url,
            icono: s.icono,
            paquete_link_id: s.paquete_link_id ?? null,
            orden: s.orden,
            activo: s.activo
          }));

          const createdSlides = await this.paqueteSlideRepository.saveMany(slideInputs);
          globalSlides.forEach((globalSlide, i) => {
            if (globalSlide.id !== undefined && createdSlides[i]?.id !== undefined) {
              idMap.set(globalSlide.id, createdSlides[i].id!);
            }
          });
        }

        // 4. Clone options with remapped slide_ids
        const globalOptions = await this.globalOptionRepository.findBySectionKey(sectionKey);
        if (globalOptions.length > 0) {
          const optionInputs = globalOptions.map(o => ({
            paquete_id: paqueteId,
            section_key: sectionKey,
            slide_id: o.slide_id !== undefined && o.slide_id !== null ? (idMap.get(o.slide_id) ?? null) : null,
            texto: o.texto,
            texto_secundario: o.texto_secundario,
            texto_terciario: o.texto_terciario,
            texto_cuarto: o.texto_cuarto,
            texto_quinto: o.texto_quinto,
            orden: o.orden,
            activo: o.activo
          }));

          await this.paqueteOptionRepository.saveMany(optionInputs as any);
        }

        // 5. Fetch and return the cloned section with relations
        const newSection = await this.paqueteSectionRepository.findByPaqueteIdAndSectionKey(paqueteId, sectionKey);
        if (newSection) {
          const sectionWithRelations = await buildPaqueteSectionWithRelations(
            newSection,
            this.paqueteSlideRepository,
            this.paqueteOptionRepository
          );
          clonedSections.push(sectionWithRelations);
        }
      }

      return {
        success: true,
        data: clonedSections,
        message: `${clonedSections.length} sección(es) clonada(s) exitosamente`
      };
    } catch (error: any) {
      console.error('Error en ClonarDesdeGlobalPaquetePageUseCase:', error);
      return { success: false, message: error.message || 'Error al clonar desde global', error: error.message };
    }
  }
}
