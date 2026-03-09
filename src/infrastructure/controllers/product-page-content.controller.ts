import { Request, Response } from 'express';
import { ObtenerSeccionesProductPageUseCase } from '@application/use-cases/obtener-secciones-product-page.use-case';
import { ObtenerSeccionProductPageUseCase } from '@application/use-cases/obtener-seccion-product-page.use-case';
import { ActualizarSeccionProductPageUseCase } from '@application/use-cases/actualizar-seccion-product-page.use-case';
import { ToggleSeccionProductPageUseCase } from '@application/use-cases/toggle-seccion-product-page.use-case';
import { CrearSlideProductPageUseCase } from '@application/use-cases/crear-slide-product-page.use-case';
import { ActualizarSlideProductPageUseCase } from '@application/use-cases/actualizar-slide-product-page.use-case';
import { EliminarSlideProductPageUseCase } from '@application/use-cases/eliminar-slide-product-page.use-case';
import { ReordenarSlidesProductPageUseCase } from '@application/use-cases/reordenar-slides-product-page.use-case';
import { CrearOptionProductPageUseCase } from '@application/use-cases/crear-option-product-page.use-case';
import { ActualizarOptionProductPageUseCase } from '@application/use-cases/actualizar-option-product-page.use-case';
import { EliminarOptionProductPageUseCase } from '@application/use-cases/eliminar-option-product-page.use-case';
import { ReordenarOptionsProductPageUseCase } from '@application/use-cases/reordenar-options-product-page.use-case';
import { SubirImagenProductPageUseCase } from '@application/use-cases/subir-imagen-product-page.use-case';

export class ProductPageContentController {
  constructor(
    private readonly obtenerSeccionesUseCase: ObtenerSeccionesProductPageUseCase,
    private readonly obtenerSeccionUseCase: ObtenerSeccionProductPageUseCase,
    private readonly actualizarSeccionUseCase: ActualizarSeccionProductPageUseCase,
    private readonly toggleSeccionUseCase: ToggleSeccionProductPageUseCase,
    private readonly crearSlideUseCase: CrearSlideProductPageUseCase,
    private readonly actualizarSlideUseCase: ActualizarSlideProductPageUseCase,
    private readonly eliminarSlideUseCase: EliminarSlideProductPageUseCase,
    private readonly reordenarSlidesUseCase: ReordenarSlidesProductPageUseCase,
    private readonly crearOptionUseCase: CrearOptionProductPageUseCase,
    private readonly actualizarOptionUseCase: ActualizarOptionProductPageUseCase,
    private readonly eliminarOptionUseCase: EliminarOptionProductPageUseCase,
    private readonly reordenarOptionsUseCase: ReordenarOptionsProductPageUseCase,
    private readonly subirImagenUseCase: SubirImagenProductPageUseCase
  ) {}

  // ============================================
  // SECCIONES
  // ============================================

  async getAllSections(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.obtenerSeccionesUseCase.execute();
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        res.status(500).json({ success: false, message: result.message || 'Error al obtener las secciones' });
      }
    } catch (error: any) {
      console.error('Error en getAllSections:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async getSectionByKey(req: Request, res: Response): Promise<void> {
    try {
      const { sectionKey } = req.params;
      const result = await this.obtenerSeccionUseCase.execute(sectionKey);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en getSectionByKey:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async updateSection(req: Request, res: Response): Promise<void> {
    try {
      const { sectionKey } = req.params;
      const result = await this.actualizarSeccionUseCase.execute(sectionKey, req.body);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en updateSection:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async toggleSection(req: Request, res: Response): Promise<void> {
    try {
      const { sectionKey } = req.params;
      const result = await this.toggleSeccionUseCase.execute(sectionKey);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en toggleSection:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // SLIDES
  // ============================================

  async createSlide(req: Request, res: Response): Promise<void> {
    try {
      const { section_key, tipo, titulo, descripcion, imagen_url, icono, orden } = req.body;

      if (!section_key || !tipo) {
        res.status(400).json({ success: false, message: 'section_key y tipo son requeridos' });
        return;
      }

      const result = await this.crearSlideUseCase.execute({
        section_key,
        tipo,
        titulo,
        descripcion,
        imagen_url,
        icono,
        orden: orden ? parseInt(orden, 10) : undefined
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
      const idNum = parseInt(req.params.id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({ success: false, message: 'ID de slide inválido' });
        return;
      }

      const result = await this.actualizarSlideUseCase.execute(idNum, req.body);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const statusCode = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en updateSlide:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async deleteSlide(req: Request, res: Response): Promise<void> {
    try {
      const idNum = parseInt(req.params.id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({ success: false, message: 'ID de slide inválido' });
        return;
      }

      const result = await this.eliminarSlideUseCase.execute(idNum);
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        const statusCode = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en deleteSlide:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async reorderSlides(req: Request, res: Response): Promise<void> {
    try {
      const { section_key, slide_ids } = req.body;

      if (!section_key || !Array.isArray(slide_ids)) {
        res.status(400).json({ success: false, message: 'section_key y slide_ids son requeridos' });
        return;
      }

      const result = await this.reordenarSlidesUseCase.execute(section_key, slide_ids);
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en reorderSlides:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // OPTIONS
  // ============================================

  async createOption(req: Request, res: Response): Promise<void> {
    try {
      const { section_key, slide_id, texto, texto_secundario, texto_terciario, texto_cuarto, texto_quinto, orden } = req.body;

      if (!section_key || !texto) {
        res.status(400).json({ success: false, message: 'section_key y texto son requeridos' });
        return;
      }

      const result = await this.crearOptionUseCase.execute({
        section_key,
        slide_id: slide_id ? parseInt(slide_id, 10) : undefined,
        texto,
        texto_secundario,
        texto_terciario,
        texto_cuarto,
        texto_quinto,
        orden: orden ? parseInt(orden, 10) : undefined
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
      const idNum = parseInt(req.params.id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({ success: false, message: 'ID de opción inválido' });
        return;
      }

      const result = await this.actualizarOptionUseCase.execute(idNum, req.body);
      if (result.success) {
        res.status(200).json({ success: true, data: result.data });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en updateOption:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async deleteOption(req: Request, res: Response): Promise<void> {
    try {
      const idNum = parseInt(req.params.id, 10);
      if (isNaN(idNum)) {
        res.status(400).json({ success: false, message: 'ID de opción inválido' });
        return;
      }

      const result = await this.eliminarOptionUseCase.execute(idNum);
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en deleteOption:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async reorderOptions(req: Request, res: Response): Promise<void> {
    try {
      const { section_key, option_ids } = req.body;

      if (!section_key || !Array.isArray(option_ids)) {
        res.status(400).json({ success: false, message: 'section_key y option_ids son requeridos' });
        return;
      }

      const result = await this.reordenarOptionsUseCase.execute(section_key, option_ids);
      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: result.message });
      }
    } catch (error: any) {
      console.error('Error en reorderOptions:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // ============================================
  // UPLOAD
  // ============================================

  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const { section_key, image_type } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo' });
        return;
      }

      const result = await this.subirImagenUseCase.execute(file, section_key, image_type);
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
