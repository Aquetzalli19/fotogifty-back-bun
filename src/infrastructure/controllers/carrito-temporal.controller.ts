import { Request, Response } from 'express';
import { ObtenerCarritoTemporalUseCase } from '@application/use-cases/obtener-carrito-temporal.use-case';
import { GuardarCarritoTemporalUseCase } from '@application/use-cases/guardar-carrito-temporal.use-case';
import { EliminarCarritoTemporalUseCase } from '@application/use-cases/eliminar-carrito-temporal.use-case';

export class CarritoTemporalController {
  constructor(
    private readonly obtenerCarritoTemporalUseCase: ObtenerCarritoTemporalUseCase,
    private readonly guardarCarritoTemporalUseCase: GuardarCarritoTemporalUseCase,
    private readonly eliminarCarritoTemporalUseCase: EliminarCarritoTemporalUseCase
  ) {}

  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const result = await this.obtenerCarritoTemporalUseCase.execute(usuarioId);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al obtener el carrito'
        });
      }
    } catch (error: any) {
      console.error('Error en obtener carrito temporal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async guardar(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        res.status(400).json({
          success: false,
          message: 'Items del carrito son requeridos y deben ser un array'
        });
        return;
      }

      const result = await this.guardarCarritoTemporalUseCase.execute(usuarioId, { items });

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al guardar el carrito'
        });
      }
    } catch (error: any) {
      console.error('Error en guardar carrito temporal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const result = await this.eliminarCarritoTemporalUseCase.execute(usuarioId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message || 'Error al eliminar el carrito'
        });
      }
    } catch (error: any) {
      console.error('Error en eliminar carrito temporal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
