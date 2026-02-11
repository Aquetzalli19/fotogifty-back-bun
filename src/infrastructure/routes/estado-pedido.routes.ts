import { Router } from 'express';
import { EstadoPedidoController } from '../controllers/estado-pedido.controller';
import { CrearEstadoPedidoUseCase } from '../../application/use-cases/crear-estado-pedido.use-case';
import { ActualizarEstadoPedidoDinamicoUseCase } from '../../application/use-cases/actualizar-estado-pedido-dinamico.use-case';
import { PrismaEstadoPedidoRepository } from '../repositories/prisma-estado-pedido.repository';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Estados de Pedido
 *   description: Gestión de estados dinámicos de pedido
 */

const estadoPedidoRoutes = (router: Router): void => {
  const estadoPedidoRepository = new PrismaEstadoPedidoRepository();
  const crearEstadoPedidoUseCase = new CrearEstadoPedidoUseCase(estadoPedidoRepository);
  const actualizarEstadoPedidoDinamicoUseCase = new ActualizarEstadoPedidoDinamicoUseCase(estadoPedidoRepository);
  const controller = new EstadoPedidoController(crearEstadoPedidoUseCase, actualizarEstadoPedidoDinamicoUseCase, estadoPedidoRepository);

  /**
   * @swagger
   * /api/estados-pedido:
   *   get:
   *     summary: Obtener todos los estados de pedido
   *     tags: [Estados de Pedido]
   *     parameters:
   *       - in: query
   *         name: todos
   *         schema:
   *           type: string
   *           enum: ['true', 'false']
   *         description: Si es true, incluye estados inactivos
   *     responses:
   *       200:
   *         description: Lista de estados de pedido
   */
  router.get('/estados-pedido', (req, res) =>
    controller.getAll(req, res)
  );

  /**
   * @swagger
   * /api/estados-pedido/{id}:
   *   get:
   *     summary: Obtener un estado de pedido por ID
   *     tags: [Estados de Pedido]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Estado de pedido encontrado
   *       404:
   *         description: No encontrado
   */
  router.get('/estados-pedido/:id', (req, res) =>
    controller.getById(req, res)
  );

  /**
   * @swagger
   * /api/estados-pedido:
   *   post:
   *     summary: Crear un nuevo estado de pedido
   *     tags: [Estados de Pedido]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre
   *             properties:
   *               nombre:
   *                 type: string
   *                 example: "En revisión"
   *               descripcion:
   *                 type: string
   *                 example: "Pedido en proceso de revisión"
   *               color:
   *                 type: string
   *                 example: "#FF9800"
   *               orden:
   *                 type: integer
   *                 example: 5
   *     responses:
   *       201:
   *         description: Estado creado exitosamente
   *       400:
   *         description: Datos inválidos o nombre duplicado
   */
  router.post('/estados-pedido', authenticateToken, requireAdmin, (req, res) =>
    controller.crear(req, res)
  );

  /**
   * @swagger
   * /api/estados-pedido/{id}:
   *   put:
   *     summary: Actualizar un estado de pedido
   *     tags: [Estados de Pedido]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *               descripcion:
   *                 type: string
   *               color:
   *                 type: string
   *               orden:
   *                 type: integer
   *               activo:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Estado actualizado exitosamente
   *       404:
   *         description: No encontrado
   */
  router.put('/estados-pedido/:id', authenticateToken, requireAdmin, (req, res) =>
    controller.update(req, res)
  );

  /**
   * @swagger
   * /api/estados-pedido/{id}:
   *   delete:
   *     summary: Eliminar un estado de pedido
   *     tags: [Estados de Pedido]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Estado eliminado exitosamente
   *       400:
   *         description: No se puede eliminar (tiene pedidos asociados)
   *       404:
   *         description: No encontrado
   */
  router.delete('/estados-pedido/:id', authenticateToken, requireAdmin, (req, res) =>
    controller.delete(req, res)
  );
};

export default estadoPedidoRoutes;
