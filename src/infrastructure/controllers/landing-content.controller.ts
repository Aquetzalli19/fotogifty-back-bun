import { Request, Response } from 'express';
import { ObtenerSeccionesLandingUseCase } from '@application/use-cases/obtener-secciones-landing.use-case';
import { ObtenerSeccionLandingUseCase } from '@application/use-cases/obtener-seccion-landing.use-case';
import { ActualizarSeccionLandingUseCase } from '@application/use-cases/actualizar-seccion-landing.use-case';
import { CrearSlideLandingUseCase } from '@application/use-cases/crear-slide-landing.use-case';
import { ActualizarSlideLandingUseCase } from '@application/use-cases/actualizar-slide-landing.use-case';
import { EliminarSlideLandingUseCase } from '@application/use-cases/eliminar-slide-landing.use-case';
import { ReordenarSlidesLandingUseCase } from '@application/use-cases/reordenar-slides-landing.use-case';
import { CrearOptionLandingUseCase } from '@application/use-cases/crear-option-landing.use-case';
import { ActualizarOptionLandingUseCase } from '@application/use-cases/actualizar-option-landing.use-case';
import { EliminarOptionLandingUseCase } from '@application/use-cases/eliminar-option-landing.use-case';
import { ReordenarOptionsLandingUseCase } from '@application/use-cases/reordenar-options-landing.use-case';
import { SubirImagenLandingUseCase } from '@application/use-cases/subir-imagen-landing.use-case';

export class LandingContentController {
  constructor(
    private readonly obtenerSeccionesLandingUseCase: ObtenerSeccionesLandingUseCase,
    private readonly obtenerSeccionLandingUseCase: ObtenerSeccionLandingUseCase,
    private readonly actualizarSeccionLandingUseCase: ActualizarSeccionLandingUseCase,
    private readonly crearSlideLandingUseCase: CrearSlideLandingUseCase,
    private readonly actualizarSlideLandingUseCase: ActualizarSlideLandingUseCase,
    private readonly eliminarSlideLandingUseCase: EliminarSlideLandingUseCase,
    private readonly reordenarSlidesLandingUseCase: ReordenarSlidesLandingUseCase,
    private readonly crearOptionLandingUseCase: CrearOptionLandingUseCase,
    private readonly actualizarOptionLandingUseCase: ActualizarOptionLandingUseCase,
    private readonly eliminarOptionLandingUseCase: EliminarOptionLandingUseCase,
    private readonly reordenarOptionsLandingUseCase: ReordenarOptionsLandingUseCase,
    private readonly subirImagenLandingUseCase: SubirImagenLandingUseCase
  ) {}

  // ============================================
  // SECCIONES
  // ============================================

  async getAllSections(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.obtenerSeccionesLandingUseCase.execute();

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message || 'Error al obtener las secciones'
        });
      }
    } catch (error: any) {
      console.error('Error en getAllSections:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getSectionByKey(req: Request, res: Response): Promise<void> {
    try {
      const { sectionKey } = req.params;

      const result = await this.obtenerSeccionLandingUseCase.execute(sectionKey);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al obtener la sección'
        });
      }
    } catch (error: any) {
      console.error('Error en getSectionByKey:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateSection(req: Request, res: Response): Promise<void> {
    try {
      const { sectionKey } = req.params;
      const updateData = req.body;

      const result = await this.actualizarSeccionLandingUseCase.execute(sectionKey, updateData);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al actualizar la sección'
        });
      }
    } catch (error: any) {
      console.error('Error en updateSection:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async toggleSection(req: Request, res: Response): Promise<void> {
    try {
      const { sectionKey } = req.params;

      // Primero obtener el estado actual
      const sectionResult = await this.obtenerSeccionLandingUseCase.execute(sectionKey);

      if (!sectionResult.success) {
        res.status(404).json({
          success: false,
          message: 'Sección no encontrada'
        });
        return;
      }

      const currentStatus = sectionResult.data.section.activo;
      const newStatus = !currentStatus;

      // Actualizar el estado
      const result = await this.actualizarSeccionLandingUseCase.execute(sectionKey, { activo: newStatus });

      if (result.success) {
        res.status(200).json({
          success: true,
          data: { activo: newStatus },
          message: newStatus ? 'Sección activada' : 'Sección desactivada'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al cambiar el estado de la sección'
        });
      }
    } catch (error: any) {
      console.error('Error en toggleSection:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // SLIDES
  // ============================================

  async createSlide(req: Request, res: Response): Promise<void> {
    try {
      const { section_key, tipo, titulo, descripcion, orden } = req.body;
      let imagen_url = req.body.imagen_url;

      // Si se subió un archivo, usarlo como imagen_url
      if (req.file) {
        // Aquí se debería integrar con S3Service para subir la imagen
        // Por ahora, usaremos la ruta temporal (esto debe ser reemplazado con S3)
        imagen_url = req.file.path || req.body.imagen_url;
      }

      const result = await this.crearSlideLandingUseCase.execute(
        section_key,
        tipo,
        imagen_url,
        titulo,
        descripcion,
        orden
      );

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al crear el slide'
        });
      }
    } catch (error: any) {
      console.error('Error en createSlide:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateSlide(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const idNum = parseInt(id, 10);

      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de slide inválido'
        });
        return;
      }

      const updateData = { ...req.body };

      // Si se subió un archivo, usarlo como imagen_url
      if (req.file) {
        // Integrar con S3Service
        updateData.imagen_url = req.file.path || req.body.imagen_url;
      }

      const result = await this.actualizarSlideLandingUseCase.execute(idNum, updateData);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        const statusCode = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al actualizar el slide'
        });
      }
    } catch (error: any) {
      console.error('Error en updateSlide:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async deleteSlide(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const idNum = parseInt(id, 10);

      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de slide inválido'
        });
        return;
      }

      const result = await this.eliminarSlideLandingUseCase.execute(idNum);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        const statusCode = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al eliminar el slide'
        });
      }
    } catch (error: any) {
      console.error('Error en deleteSlide:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async reorderSlides(req: Request, res: Response): Promise<void> {
    try {
      const { section_key, slide_ids } = req.body;

      const result = await this.reordenarSlidesLandingUseCase.execute(section_key, slide_ids);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al reordenar los slides'
        });
      }
    } catch (error: any) {
      console.error('Error en reorderSlides:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OPTIONS
  // ============================================

  async createOption(req: Request, res: Response): Promise<void> {
    try {
      const { section_key, texto, orden } = req.body;

      const result = await this.crearOptionLandingUseCase.execute(section_key, texto, orden);

      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al crear la opción'
        });
      }
    } catch (error: any) {
      console.error('Error en createOption:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateOption(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const idNum = parseInt(id, 10);

      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de opción inválido'
        });
        return;
      }

      const updateData = req.body;

      const result = await this.actualizarOptionLandingUseCase.execute(idNum, updateData);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al actualizar la opción'
        });
      }
    } catch (error: any) {
      console.error('Error en updateOption:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async deleteOption(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const idNum = parseInt(id, 10);

      if (isNaN(idNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de opción inválido'
        });
        return;
      }

      const result = await this.eliminarOptionLandingUseCase.execute(idNum);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        const statusCode = result.error?.includes('no encontrada') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al eliminar la opción'
        });
      }
    } catch (error: any) {
      console.error('Error en deleteOption:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async reorderOptions(req: Request, res: Response): Promise<void> {
    try {
      const { section_key, option_ids } = req.body;

      const result = await this.reordenarOptionsLandingUseCase.execute(section_key, option_ids);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al reordenar las opciones'
        });
      }
    } catch (error: any) {
      console.error('Error en reorderOptions:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // UPLOAD
  // ============================================

  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No se proporcionó ninguna imagen'
        });
        return;
      }

      const { section_key, image_type } = req.body;

      // Validar parámetros requeridos
      if (!section_key) {
        res.status(400).json({
          success: false,
          message: 'Se requiere el campo section_key'
        });
        return;
      }

      if (!image_type) {
        res.status(400).json({
          success: false,
          message: 'Se requiere el campo image_type (main, background, o slide)'
        });
        return;
      }

      // Subir imagen a S3
      const result = await this.subirImagenLandingUseCase.execute(
        req.file,
        section_key,
        image_type as 'main' | 'background' | 'slide'
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al subir la imagen'
        });
      }
    } catch (error: any) {
      console.error('Error en uploadImage:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
