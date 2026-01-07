import { Request, Response } from 'express';
import { ObtenerAnalyticsUseCase } from '../../application/use-cases/obtener-analytics.use-case';

export class AnalyticsController {
  constructor(
    private readonly obtenerAnalyticsUseCase: ObtenerAnalyticsUseCase
  ) {}

  /**
   * GET /api/analytics
   * Obtiene todos los datos de analytics en una sola petición
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin, categoria } = req.query;

      // Validar parámetros requeridos
      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          message: 'fechaInicio y fechaFin son requeridos'
        });
        return;
      }

      // Convertir strings a Date
      const inicio = new Date(fechaInicio as string);
      const fin = new Date(fechaFin as string);

      // Validar que las fechas sean válidas
      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Fechas inválidas. Use formato YYYY-MM-DD'
        });
        return;
      }

      // Ajustar fechaFin para incluir todo el día (23:59:59.999)
      fin.setHours(23, 59, 59, 999);

      // Validar que fechaInicio <= fechaFin
      if (inicio > fin) {
        res.status(400).json({
          success: false,
          message: 'fechaInicio debe ser menor o igual a fechaFin'
        });
        return;
      }

      // Ejecutar caso de uso
      const analytics = await this.obtenerAnalyticsUseCase.execute(
        inicio,
        fin,
        categoria as string | undefined
      );

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      console.error('Error en getAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * GET /api/analytics/kpis
   * Obtiene solo los KPIs principales
   */
  async getKPIs(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          message: 'fechaInicio y fechaFin son requeridos'
        });
        return;
      }

      const inicio = new Date(fechaInicio as string);
      const fin = new Date(fechaFin as string);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Fechas inválidas'
        });
        return;
      }

      // Ajustar fechaFin para incluir todo el día (23:59:59.999)
      fin.setHours(23, 59, 59, 999);

      const analytics = await this.obtenerAnalyticsUseCase.execute(inicio, fin);

      res.status(200).json({
        success: true,
        data: analytics.kpis
      });
    } catch (error: any) {
      console.error('Error en getKPIs:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/analytics/ventas-por-dia
   * Obtiene ventas agrupadas por día
   */
  async getVentasPorDia(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          message: 'fechaInicio y fechaFin son requeridos'
        });
        return;
      }

      const inicio = new Date(fechaInicio as string);
      const fin = new Date(fechaFin as string);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Fechas inválidas'
        });
        return;
      }

      // Ajustar fechaFin para incluir todo el día (23:59:59.999)
      fin.setHours(23, 59, 59, 999);

      const analytics = await this.obtenerAnalyticsUseCase.execute(inicio, fin);

      res.status(200).json({
        success: true,
        data: analytics.ventasPorDia
      });
    } catch (error: any) {
      console.error('Error en getVentasPorDia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/analytics/productos-top
   * Obtiene los productos más vendidos
   */
  async getProductosTop(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin, categoria } = req.query;

      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          message: 'fechaInicio y fechaFin son requeridos'
        });
        return;
      }

      const inicio = new Date(fechaInicio as string);
      const fin = new Date(fechaFin as string);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Fechas inválidas'
        });
        return;
      }

      // Ajustar fechaFin para incluir todo el día (23:59:59.999)
      fin.setHours(23, 59, 59, 999);

      const analytics = await this.obtenerAnalyticsUseCase.execute(
        inicio,
        fin,
        categoria as string | undefined
      );

      res.status(200).json({
        success: true,
        data: analytics.productosTopVentas
      });
    } catch (error: any) {
      console.error('Error en getProductosTop:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/analytics/ventas-por-categoria
   * Obtiene ventas agrupadas por categoría
   */
  async getVentasPorCategoria(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          message: 'fechaInicio y fechaFin son requeridos'
        });
        return;
      }

      const inicio = new Date(fechaInicio as string);
      const fin = new Date(fechaFin as string);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Fechas inválidas'
        });
        return;
      }

      // Ajustar fechaFin para incluir todo el día (23:59:59.999)
      fin.setHours(23, 59, 59, 999);

      const analytics = await this.obtenerAnalyticsUseCase.execute(inicio, fin);

      res.status(200).json({
        success: true,
        data: analytics.ventasPorCategoria
      });
    } catch (error: any) {
      console.error('Error en getVentasPorCategoria:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * GET /api/analytics/estados-pedidos
   * Obtiene distribución de estados de pedidos
   */
  async getEstadosPedidos(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
        res.status(400).json({
          success: false,
          message: 'fechaInicio y fechaFin son requeridos'
        });
        return;
      }

      const inicio = new Date(fechaInicio as string);
      const fin = new Date(fechaFin as string);

      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Fechas inválidas'
        });
        return;
      }

      // Ajustar fechaFin para incluir todo el día (23:59:59.999)
      fin.setHours(23, 59, 59, 999);

      const analytics = await this.obtenerAnalyticsUseCase.execute(inicio, fin);

      res.status(200).json({
        success: true,
        data: analytics.estadosPedidos
      });
    } catch (error: any) {
      console.error('Error en getEstadosPedidos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
