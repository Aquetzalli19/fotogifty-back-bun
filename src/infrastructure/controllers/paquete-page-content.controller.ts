import { Request, Response } from 'express';
import { ObtenerContenidoMergedPaquetePageUseCase } from '@application/use-cases/obtener-contenido-merged-paquete-page.use-case';
import { ObtenerStatusOverridesPaquetePageUseCase } from '@application/use-cases/obtener-status-overrides-paquete-page.use-case';
import { ObtenerSeccionesPaquetePageUseCase } from '@application/use-cases/obtener-secciones-paquete-page.use-case';
import { UpsertSeccionPaquetePageUseCase } from '@application/use-cases/upsert-seccion-paquete-page.use-case';
import { EliminarSeccionPaquetePageUseCase } from '@application/use-cases/eliminar-seccion-paquete-page.use-case';
import { ToggleSeccionPaquetePageUseCase } from '@application/use-cases/toggle-seccion-paquete-page.use-case';
import { CrearSlidePaquetePageUseCase } from '@application/use-cases/crear-slide-paquete-page.use-case';
import { ActualizarSlidePaquetePageUseCase } from '@application/use-cases/actualizar-slide-paquete-page.use-case';
import { EliminarSlidePaquetePageUseCase } from '@application/use-cases/eliminar-slide-paquete-page.use-case';
import { ReordenarSlidesPaquetePageUseCase } from '@application/use-cases/reordenar-slides-paquete-page.use-case';
import { CrearOptionPaquetePageUseCase } from '@application/use-cases/crear-option-paquete-page.use-case';
import { ActualizarOptionPaquetePageUseCase } from '@application/use-cases/actualizar-option-paquete-page.use-case';
import { EliminarOptionPaquetePageUseCase } from '@application/use-cases/eliminar-option-paquete-page.use-case';
import { ReordenarOptionsPaquetePageUseCase } from '@application/use-cases/reordenar-options-paquete-page.use-case';
import { ClonarDesdeGlobalPaquetePageUseCase } from '@application/use-cases/clonar-desde-global-paquete-page.use-case';
import { SubirImagenPaquetePageUseCase } from '@application/use-cases/subir-imagen-paquete-page.use-case';

export class PaquetePageContentController {
  constructor(
    private readonly mergedUseCase: ObtenerContenidoMergedPaquetePageUseCase,
    private readonly statusUseCase: ObtenerStatusOverridesPaquetePageUseCase,
    private readonly seccionesUseCase: ObtenerSeccionesPaquetePageUseCase,
    private readonly upsertSeccionUseCase: UpsertSeccionPaquetePageUseCase,
    private readonly eliminarSeccionUseCase: EliminarSeccionPaquetePageUseCase,
    private readonly toggleSeccionUseCase: ToggleSeccionPaquetePageUseCase,
    private readonly crearSlideUseCase: CrearSlidePaquetePageUseCase,
    private readonly actualizarSlideUseCase: ActualizarSlidePaquetePageUseCase,
    private readonly eliminarSlideUseCase: EliminarSlidePaquetePageUseCase,
    private readonly reordenarSlidesUseCase: ReordenarSlidesPaquetePageUseCase,
    private readonly crearOptionUseCase: CrearOptionPaquetePageUseCase,
    private readonly actualizarOptionUseCase: ActualizarOptionPaquetePageUseCase,
    private readonly eliminarOptionUseCase: EliminarOptionPaquetePageUseCase,
    private readonly reordenarOptionsUseCase: ReordenarOptionsPaquetePageUseCase,
    private readonly clonarUseCase: ClonarDesdeGlobalPaquetePageUseCase,
    private readonly subirImagenUseCase: SubirImagenPaquetePageUseCase
  ) {}

  private parsePaqueteId(req: Request, res: Response): number | null {
    const id = parseInt(req.params.paqueteId, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'paqueteId inválido' });
      return null;
    }
    return id;
  }

  // ============================================
  // MERGED / STATUS / SECTIONS READ
  // ============================================

  async getMergedContent(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const result = await this.mergedUseCase.execute(paqueteId);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const status = result.error?.includes('no encontrado') ? 404 : 500;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en getMergedContent:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async getOverrideStatus(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const result = await this.statusUseCase.execute(paqueteId);
      res.status(result.success ? 200 : 500).json(result.success ? { success: true, data: result.data } : { success: false, message: result.message });
    } catch (error: any) {
      console.error('Error en getOverrideStatus:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async getSections(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const result = await this.seccionesUseCase.execute(paqueteId);
      res.status(result.success ? 200 : 500).json(result.success ? { success: true, data: result.data } : { success: false, message: result.message });
    } catch (error: any) {
      console.error('Error en getSections:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // SECCIONES CRUD
  // ============================================

  async upsertSection(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const { sectionKey } = req.params;
      const result = await this.upsertSeccionUseCase.execute(paqueteId, sectionKey, req.body);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const status = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en upsertSection:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async deleteSection(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const { sectionKey } = req.params;
      const result = await this.eliminarSeccionUseCase.execute(paqueteId, sectionKey);
      if (result.success) {
        res.status(200).json({ success: true, message: result.message });
      } else {
        const status = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en deleteSection:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async toggleSection(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const { sectionKey } = req.params;
      const result = await this.toggleSeccionUseCase.execute(paqueteId, sectionKey);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const status = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en toggleSection:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // SLIDES CRUD
  // ============================================

  async createSlide(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const { section_key, tipo, titulo, descripcion, imagen_url, icono, orden } = req.body;
      if (!section_key || !tipo) {
        res.status(400).json({ success: false, message: 'section_key y tipo son requeridos' });
        return;
      }
      const result = await this.crearSlideUseCase.execute({
        paquete_id: paqueteId, section_key, tipo, titulo, descripcion, imagen_url, icono,
        orden: orden !== undefined ? parseInt(orden, 10) : undefined
      });
      if (result.success) {
        res.status(201).json({ success: true, data: result.data });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en createSlide:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async updateSlide(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const slideId = parseInt(req.params.slideId, 10);
      if (isNaN(slideId)) { res.status(400).json({ success: false, message: 'slideId inválido' }); return; }
      const result = await this.actualizarSlideUseCase.execute(paqueteId, slideId, req.body);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const status = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en updateSlide:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async deleteSlide(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const slideId = parseInt(req.params.slideId, 10);
      if (isNaN(slideId)) { res.status(400).json({ success: false, message: 'slideId inválido' }); return; }
      const result = await this.eliminarSlideUseCase.execute(paqueteId, slideId);
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        const status = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en deleteSlide:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async reorderSlides(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const { section_key, slide_ids } = req.body;
      if (!section_key || !Array.isArray(slide_ids)) {
        res.status(400).json({ success: false, message: 'section_key y slide_ids son requeridos' });
        return;
      }
      const result = await this.reordenarSlidesUseCase.execute(paqueteId, section_key, slide_ids);
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        const status = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en reorderSlides:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // OPTIONS CRUD
  // ============================================

  async createOption(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const { section_key, slide_id, texto, texto_secundario, texto_terciario, texto_cuarto, texto_quinto, orden } = req.body;
      if (!section_key || !texto) {
        res.status(400).json({ success: false, message: 'section_key y texto son requeridos' });
        return;
      }
      const result = await this.crearOptionUseCase.execute({
        paquete_id: paqueteId, section_key,
        slide_id: slide_id !== undefined ? parseInt(slide_id, 10) : undefined,
        texto, texto_secundario, texto_terciario, texto_cuarto, texto_quinto,
        orden: orden !== undefined ? parseInt(orden, 10) : undefined
      });
      if (result.success) {
        res.status(201).json({ success: true, data: result.data });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en createOption:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async updateOption(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const optionId = parseInt(req.params.optionId, 10);
      if (isNaN(optionId)) { res.status(400).json({ success: false, message: 'optionId inválido' }); return; }
      const result = await this.actualizarOptionUseCase.execute(paqueteId, optionId, req.body);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const status = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en updateOption:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async deleteOption(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const optionId = parseInt(req.params.optionId, 10);
      if (isNaN(optionId)) { res.status(400).json({ success: false, message: 'optionId inválido' }); return; }
      const result = await this.eliminarOptionUseCase.execute(paqueteId, optionId);
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        const status = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en deleteOption:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async reorderOptions(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const { section_key, option_ids } = req.body;
      if (!section_key || !Array.isArray(option_ids)) {
        res.status(400).json({ success: false, message: 'section_key y option_ids son requeridos' });
        return;
      }
      const result = await this.reordenarOptionsUseCase.execute(paqueteId, section_key, option_ids);
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        const status = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en reorderOptions:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // CLONE + UPLOAD
  // ============================================

  async cloneFromGlobal(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const { section_keys } = req.body;
      const result = await this.clonarUseCase.execute(paqueteId, section_keys);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data, message: result.message });
      } else {
        const status = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(status).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en cloneFromGlobal:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const paqueteId = this.parsePaqueteId(req, res);
      if (paqueteId === null) return;
      const { section_key, image_type } = req.body;
      const file = req.file;
      if (!file) { res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo' }); return; }
      const result = await this.subirImagenUseCase.execute(file, paqueteId, section_key, image_type);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data, message: result.message });
      } else {
        res.status(400).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en uploadImage:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
}
