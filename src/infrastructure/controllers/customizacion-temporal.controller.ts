import { Request, Response } from 'express';
import { ObtenerCustomizacionesTemporalesUseCase } from '@application/use-cases/obtener-customizaciones-temporales.use-case';
import { GuardarCustomizacionTemporalUseCase } from '@application/use-cases/guardar-customizacion-temporal.use-case';
import { EliminarCustomizacionTemporalUseCase } from '@application/use-cases/eliminar-customizacion-temporal.use-case';
import { EliminarTodasCustomizacionesTemporalesUseCase } from '@application/use-cases/eliminar-todas-customizaciones-temporales.use-case';
import { DuplicarCustomizacionTemporalUseCase } from '@application/use-cases/duplicar-customizacion-temporal.use-case';
import { EditorType } from '@domain/entities/customizacion-temporal.entity';

export class CustomizacionTemporalController {
  constructor(
    private readonly obtenerUseCase: ObtenerCustomizacionesTemporalesUseCase,
    private readonly guardarUseCase: GuardarCustomizacionTemporalUseCase,
    private readonly eliminarUseCase: EliminarCustomizacionTemporalUseCase,
    private readonly eliminarTodasUseCase: EliminarTodasCustomizacionesTemporalesUseCase,
    private readonly duplicarUseCase?: DuplicarCustomizacionTemporalUseCase
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

  async duplicar(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) {
        res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        return;
      }

      if (!this.duplicarUseCase) {
        res.status(500).json({ success: false, message: 'Operación no disponible' });
        return;
      }

      const { cartItemId } = req.params;
      const { sourceInstanceIndex, targetInstanceIndex } = req.body;

      const result = await this.duplicarUseCase.execute(
        usuarioId,
        cartItemId,
        sourceInstanceIndex,
        targetInstanceIndex
      );

      if (!result.success) {
        const statusMap: Record<string, number> = {
          VALIDATION_ERROR: 400,
          CUSTOMIZATION_NOT_FOUND: 404,
          INSTANCE_ALREADY_EXISTS: 409,
          MAX_INSTANCES_EXCEEDED: 400
        };
        const status = result.error ? (statusMap[result.error] ?? 500) : 500;
        res.status(status).json({
          success: false,
          error: result.error,
          message: result.message,
          details: result.details
        });
        return;
      }

      res.status(201).json({ success: true, data: result.data, message: result.message });
    } catch (error: any) {
      console.error('Error duplicar customización:', error);
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
