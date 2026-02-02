import { Request, Response } from 'express';
import { SubirImagenTemporalUseCase } from '@application/use-cases/subir-imagen-temporal.use-case';
import { ObtenerUrlImagenTemporalUseCase } from '@application/use-cases/obtener-url-imagen-temporal.use-case';
import { EliminarImagenTemporalUseCase } from '@application/use-cases/eliminar-imagen-temporal.use-case';
import { EliminarTodasImagenesTemporalesUseCase } from '@application/use-cases/eliminar-todas-imagenes-temporales.use-case';

export class ImagenTemporalController {
  constructor(
    private readonly subirUseCase: SubirImagenTemporalUseCase,
    private readonly obtenerUrlUseCase: ObtenerUrlImagenTemporalUseCase,
    private readonly eliminarUseCase: EliminarImagenTemporalUseCase,
    private readonly eliminarTodasUseCase: EliminarTodasImagenesTemporalesUseCase
  ) {}

  async subir(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) {
        res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: 'No se proporcionó ninguna imagen' });
        return;
      }

      const result = await this.subirUseCase.execute(usuarioId, req.file);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      console.error('Error subir imagen temporal:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async obtenerUrl(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) {
        res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        return;
      }

      const { imageId } = req.params;
      const result = await this.obtenerUrlUseCase.execute(usuarioId, parseInt(imageId));

      const statusCode = result.error === 'Forbidden' ? 403 : (result.success ? 200 : 400);
      res.status(statusCode).json(result);
    } catch (error: any) {
      console.error('Error obtener URL imagen:', error);
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

      const { imageId } = req.params;
      const result = await this.eliminarUseCase.execute(usuarioId, parseInt(imageId));

      const statusCode = result.error === 'Forbidden' ? 403 : (result.success ? 200 : 400);
      res.status(statusCode).json(result);
    } catch (error: any) {
      console.error('Error eliminar imagen temporal:', error);
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
      console.error('Error eliminar todas imágenes temporales:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
}
