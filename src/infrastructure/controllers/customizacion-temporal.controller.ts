import { Request, Response } from 'express';
import { ObtenerCustomizacionesTemporalesUseCase } from '@application/use-cases/obtener-customizaciones-temporales.use-case';
import { GuardarCustomizacionTemporalUseCase } from '@application/use-cases/guardar-customizacion-temporal.use-case';
import { EliminarCustomizacionTemporalUseCase } from '@application/use-cases/eliminar-customizacion-temporal.use-case';
import { EliminarTodasCustomizacionesTemporalesUseCase } from '@application/use-cases/eliminar-todas-customizaciones-temporales.use-case';
import { EditorType } from '@domain/entities/customizacion-temporal.entity';

export class CustomizacionTemporalController {
  constructor(
    private readonly obtenerUseCase: ObtenerCustomizacionesTemporalesUseCase,
    private readonly guardarUseCase: GuardarCustomizacionTemporalUseCase,
    private readonly eliminarUseCase: EliminarCustomizacionTemporalUseCase,
    private readonly eliminarTodasUseCase: EliminarTodasCustomizacionesTemporalesUseCase
  ) {}

  async obtenerTodas(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) {
        res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        return;
      }

      const result = await this.obtenerUseCase.execute(usuarioId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error('Error obtener customizaciones:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async guardar(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) {
        res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        return;
      }

      const { cartItemId, instanceIndex } = req.params;
      const { editorType, data, completed } = req.body;

      const result = await this.guardarUseCase.execute(
        usuarioId,
        cartItemId,
        parseInt(instanceIndex),
        editorType as EditorType,
        data,
        completed
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error('Error guardar customización:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) {
        res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        return;
      }

      const { cartItemId, instanceIndex } = req.params;

      const result = await this.eliminarUseCase.execute(
        usuarioId,
        cartItemId,
        parseInt(instanceIndex)
      );

      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error('Error eliminar customización:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async eliminarTodas(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) {
        res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        return;
      }

      const result = await this.eliminarTodasUseCase.execute(usuarioId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error('Error eliminar todas customizaciones:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
}
