import { Request, Response } from 'express';
import { ObtenerFooterConfigUseCase } from '@application/use-cases/obtener-footer-config.use-case';
import { ActualizarFooterConfigUseCase } from '@application/use-cases/actualizar-footer-config.use-case';
import { CrearSocialLinkUseCase } from '@application/use-cases/crear-social-link.use-case';
import { ActualizarSocialLinkUseCase } from '@application/use-cases/actualizar-social-link.use-case';
import { EliminarSocialLinkUseCase } from '@application/use-cases/eliminar-social-link.use-case';
import { ReordenarSocialLinksUseCase } from '@application/use-cases/reordenar-social-links.use-case';

export class FooterController {
  constructor(
    private readonly obtenerFooterConfigUseCase: ObtenerFooterConfigUseCase,
    private readonly actualizarFooterConfigUseCase: ActualizarFooterConfigUseCase,
    private readonly crearSocialLinkUseCase: CrearSocialLinkUseCase,
    private readonly actualizarSocialLinkUseCase: ActualizarSocialLinkUseCase,
    private readonly eliminarSocialLinkUseCase: EliminarSocialLinkUseCase,
    private readonly reordenarSocialLinksUseCase: ReordenarSocialLinksUseCase
  ) {}

  /**
   * GET /api/footer/config
   * Endpoint público - Obtiene la configuración del footer con enlaces sociales activos
   */
  async getFooterConfig(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.obtenerFooterConfigUseCase.execute();

      if (result.success) {
        // Transformar a camelCase para la respuesta
        const data = result.data;
        const response = {
          id: data?.id,
          descripcion: data?.descripcion || null,
          email: data?.email || null,
          telefono: data?.telefono || null,
          socialLinks: data?.socialLinks?.map(link => ({
            id: link.id,
            plataforma: link.plataforma,
            url: link.url,
            orden: link.orden,
            activo: link.activo
          })) || [],
          updatedAt: data?.updated_at
        };

        res.status(200).json(response);
      } else {
        res.status(500).json({
          success: false,
          message: result.message || 'Error al obtener la configuración del footer'
        });
      }
    } catch (error: any) {
      console.error('Error en getFooterConfig:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/footer/config
   * Endpoint protegido - Actualiza la configuración general del footer
   */
  async updateFooterConfig(req: Request, res: Response): Promise<void> {
    try {
      const { descripcion, email, telefono } = req.body;

      const result = await this.actualizarFooterConfigUseCase.execute({
        descripcion,
        email,
        telefono
      });

      if (result.success) {
        // Transformar a camelCase para la respuesta
        const data = result.data;
        const response = {
          id: data?.id,
          descripcion: data?.descripcion || null,
          email: data?.email || null,
          telefono: data?.telefono || null,
          socialLinks: data?.socialLinks?.map(link => ({
            id: link.id,
            plataforma: link.plataforma,
            url: link.url,
            orden: link.orden,
            activo: link.activo
          })) || [],
          updatedAt: data?.updated_at
        };

        res.status(200).json(response);
      } else {
        const statusCode = result.error?.includes('inválido') ? 400 : 500;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al actualizar la configuración'
        });
      }
    } catch (error: any) {
      console.error('Error en updateFooterConfig:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * POST /api/footer/social-links
   * Endpoint protegido - Crea un nuevo enlace de red social
   */
  async createSocialLink(req: Request, res: Response): Promise<void> {
    try {
      const { plataforma, url, orden, activo } = req.body;

      const result = await this.crearSocialLinkUseCase.execute({
        plataforma,
        url,
        orden,
        activo
      });

      if (result.success) {
        const data = result.data;
        const response = {
          id: data?.id,
          plataforma: data?.plataforma,
          url: data?.url,
          orden: data?.orden,
          activo: data?.activo
        };

        res.status(201).json(response);
      } else {
        const statusCode = result.error?.includes('duplicada') ? 409 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al crear el enlace social'
        });
      }
    } catch (error: any) {
      console.error('Error en createSocialLink:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/footer/social-links/:id
   * Endpoint protegido - Actualiza un enlace de red social existente
   */
  async updateSocialLink(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID debe ser un número válido'
        });
        return;
      }

      const { plataforma, url, orden, activo } = req.body;

      const result = await this.actualizarSocialLinkUseCase.execute(id, {
        plataforma,
        url,
        orden,
        activo
      });

      if (result.success) {
        const data = result.data;
        const response = {
          id: data?.id,
          plataforma: data?.plataforma,
          url: data?.url,
          orden: data?.orden,
          activo: data?.activo
        };

        res.status(200).json(response);
      } else {
        const statusCode = result.error?.includes('no encontrado') ? 404 :
                          result.error?.includes('duplicada') ? 409 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al actualizar el enlace'
        });
      }
    } catch (error: any) {
      console.error('Error en updateSocialLink:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * DELETE /api/footer/social-links/:id
   * Endpoint protegido - Elimina un enlace de red social
   */
  async deleteSocialLink(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'El ID debe ser un número válido'
        });
        return;
      }

      const result = await this.eliminarSocialLinkUseCase.execute(id);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message || 'Enlace eliminado exitosamente'
        });
      } else {
        const statusCode = result.error?.includes('no encontrado') ? 404 : 500;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al eliminar el enlace'
        });
      }
    } catch (error: any) {
      console.error('Error en deleteSocialLink:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * PUT /api/footer/social-links/reorder
   * Endpoint protegido - Reordena múltiples enlaces sociales
   */
  async reorderSocialLinks(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      const result = await this.reordenarSocialLinksUseCase.execute(ids);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message || 'Orden actualizado exitosamente'
        });
      } else {
        const statusCode = result.error?.includes('no encontrado') ? 404 : 400;
        res.status(statusCode).json({
          success: false,
          message: result.message || 'Error al reordenar los enlaces'
        });
      }
    } catch (error: any) {
      console.error('Error en reorderSocialLinks:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
