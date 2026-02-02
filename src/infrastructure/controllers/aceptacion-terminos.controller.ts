import { Request, Response } from 'express';
import { ObtenerEstadoTerminosUseCase } from '@application/use-cases/obtener-estado-terminos.use-case';
import { AceptarTerminosUseCase } from '@application/use-cases/aceptar-terminos.use-case';
import { TipoDocumentoLegal } from '@domain/entities/documento-legal.entity';

export class AceptacionTerminosController {
  constructor(
    private obtenerEstadoTerminosUseCase: ObtenerEstadoTerminosUseCase,
    private aceptarTerminosUseCase: AceptarTerminosUseCase
  ) {}

  /**
   * GET /api/usuarios/:id/terms-status
   * Obtiene el estado de aceptación de términos de un usuario
   */
  async getTermsStatus(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = parseInt(req.params.id);

      if (isNaN(usuarioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      const result = await this.obtenerEstadoTerminosUseCase.execute(usuarioId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.estados
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en getTermsStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estado de términos'
      });
    }
  }

  /**
   * POST /api/usuarios/:id/accept-terms
   * Registra la aceptación de términos de un usuario
   * Body: { tipo_documento: 'terms' | 'privacy' }
   */
  async acceptTerms(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = parseInt(req.params.id);
      const { tipo_documento } = req.body;

      if (isNaN(usuarioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      if (!tipo_documento) {
        res.status(400).json({
          success: false,
          message: 'El tipo de documento es requerido'
        });
        return;
      }

      // Validar tipo de documento
      const tipoValido = Object.values(TipoDocumentoLegal).includes(tipo_documento);
      if (!tipoValido) {
        res.status(400).json({
          success: false,
          message: 'Tipo de documento inválido. Debe ser "terms" o "privacy"'
        });
        return;
      }

      // Obtener IP y User-Agent del request
      const ip_address = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.socket.remoteAddress
        || undefined;
      const user_agent = req.headers['user-agent'] || undefined;

      const result = await this.aceptarTerminosUseCase.execute({
        usuario_id: usuarioId,
        tipo_documento: tipo_documento as TipoDocumentoLegal,
        ip_address,
        user_agent
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          message: result.message,
          data: result.aceptacion
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error en acceptTerms:', error);
      res.status(500).json({
        success: false,
        message: 'Error al aceptar términos'
      });
    }
  }
}
