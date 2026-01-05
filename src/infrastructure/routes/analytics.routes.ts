import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { ObtenerAnalyticsUseCase } from '../../application/use-cases/obtener-analytics.use-case';
import { PrismaPedidoRepository } from '../repositories/prisma-pedido.repository';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const analyticsRoutes = (router: Router): void => {
  // Dependencias
  const pedidoRepository = new PrismaPedidoRepository();
  const obtenerAnalyticsUseCase = new ObtenerAnalyticsUseCase(pedidoRepository);
  const analyticsController = new AnalyticsController(obtenerAnalyticsUseCase);

  /**
   * @swagger
   * /api/analytics:
   *   get:
   *     summary: Obtener todos los datos de analytics
   *     description: Retorna KPIs, ventas por día, productos top, ventas por categoría y estados de pedidos
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: fechaInicio
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha de inicio (YYYY-MM-DD)
   *         example: "2024-12-01"
   *       - in: query
   *         name: fechaFin
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: Fecha de fin (YYYY-MM-DD)
   *         example: "2025-01-05"
   *       - in: query
   *         name: categoria
   *         required: false
   *         schema:
   *           type: string
   *         description: Filtrar por categoría específica
   *     responses:
   *       200:
   *         description: Datos de analytics obtenidos exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     kpis:
   *                       type: object
   *                     ventasPorDia:
   *                       type: array
   *                     productosTopVentas:
   *                       type: array
   *                     ventasPorCategoria:
   *                       type: array
   *                     estadosPedidos:
   *                       type: array
   *       400:
   *         description: Parámetros inválidos
   *       401:
   *         description: No autorizado
   *       403:
   *         description: Se requiere rol de administrador
   */
  router.get('/analytics', authenticateToken, requireAdmin, (req, res) =>
    analyticsController.getAnalytics(req, res)
  );

  /**
   * @swagger
   * /api/analytics/kpis:
   *   get:
   *     summary: Obtener KPIs principales
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: fechaInicio
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: fechaFin
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: KPIs obtenidos exitosamente
   */
  router.get('/analytics/kpis', authenticateToken, requireAdmin, (req, res) =>
    analyticsController.getKPIs(req, res)
  );

  /**
   * @swagger
   * /api/analytics/ventas-por-dia:
   *   get:
   *     summary: Obtener ventas agrupadas por día
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: fechaInicio
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: fechaFin
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: Ventas por día obtenidas exitosamente
   */
  router.get('/analytics/ventas-por-dia', authenticateToken, requireAdmin, (req, res) =>
    analyticsController.getVentasPorDia(req, res)
  );

  /**
   * @swagger
   * /api/analytics/productos-top:
   *   get:
   *     summary: Obtener productos más vendidos
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: fechaInicio
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: fechaFin
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: categoria
   *         required: false
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Productos top obtenidos exitosamente
   */
  router.get('/analytics/productos-top', authenticateToken, requireAdmin, (req, res) =>
    analyticsController.getProductosTop(req, res)
  );

  /**
   * @swagger
   * /api/analytics/ventas-por-categoria:
   *   get:
   *     summary: Obtener ventas agrupadas por categoría
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: fechaInicio
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: fechaFin
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: Ventas por categoría obtenidas exitosamente
   */
  router.get('/analytics/ventas-por-categoria', authenticateToken, requireAdmin, (req, res) =>
    analyticsController.getVentasPorCategoria(req, res)
  );

  /**
   * @swagger
   * /api/analytics/estados-pedidos:
   *   get:
   *     summary: Obtener distribución de estados de pedidos
   *     tags: [Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: fechaInicio
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: fechaFin
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: Estados de pedidos obtenidos exitosamente
   */
  router.get('/analytics/estados-pedidos', authenticateToken, requireAdmin, (req, res) =>
    analyticsController.getEstadosPedidos(req, res)
  );
};

export default analyticsRoutes;
