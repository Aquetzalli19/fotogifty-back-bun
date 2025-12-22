import { Router } from 'express';
import { StoreController } from '@infrastructure/controllers/store.controller';
import { CrearStoreUseCase } from '@application/use-cases/crear-store.use-case';
import { ActualizarStoreUseCase } from '@application/use-cases/actualizar-store.use-case';
import { PrismaStoreRepository } from '@infrastructure/repositories/prisma-store.repository';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: Gestión de stores
 */

const storeRoutes = (router: Router): void => {
  const storeRepository = new PrismaStoreRepository();
  const crearStoreUseCase = new CrearStoreUseCase(storeRepository);
  const actualizarStoreUseCase = new ActualizarStoreUseCase(storeRepository);
  const storeController = new StoreController(crearStoreUseCase, actualizarStoreUseCase, storeRepository);

  /**
   * @swagger
   * /api/stores:
   *   post:
   *     summary: Crear un nuevo store (solo administradores)
   *     tags: [Stores]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - nombre
   *               - apellido
   *               - codigo_empleado
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del store
   *                 example: "store@ejemplo.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Contraseña (mínimo 6 caracteres)
   *                 example: "password123"
   *               nombre:
   *                 type: string
   *                 description: Nombre del store
   *                 example: "Juan"
   *               apellido:
   *                 type: string
   *                 description: Apellido del store
   *                 example: "Pérez"
   *               codigo_empleado:
   *                 type: string
   *                 description: Código de empleado único
   *                 example: "S001"
   *               telefono:
   *                 type: string
   *                 description: Teléfono opcional
   *                 example: "+34612345678"
   *     responses:
   *       201:
   *         description: Store creado exitosamente
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
   *                     id:
   *                       type: integer
   *                     id_store:
   *                       type: integer
   *                     email:
   *                       type: string
   *                     nombre:
   *                       type: string
   *                     apellido:
   *                       type: string
   *                     telefono:
   *                       type: string
   *                     fecha_registro:
   *                       type: string
   *                       format: date-time
   *                     activo:
   *                       type: boolean
   *                     codigo_empleado:
   *                       type: string
   *                     fecha_contratacion:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Datos de entrada inválidos
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/stores', authenticateToken, requireAdmin, (req, res) =>
    storeController.crearStore(req, res)
  );

  /**
   * @swagger
   * /api/stores:
   *   get:
   *     summary: Obtener todos los stores (solo administradores)
   *     tags: [Stores]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de todos los stores
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       id_store:
   *                         type: integer
   *                       email:
   *                         type: string
   *                       nombre:
   *                         type: string
   *                       apellido:
   *                         type: string
   *                       telefono:
   *                         type: string
   *                       fecha_registro:
   *                         type: string
   *                       activo:
   *                         type: boolean
   *                       codigo_empleado:
   *                         type: string
   *                       fecha_contratacion:
   *                         type: string
   *                       format: date-time
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/stores', authenticateToken, requireAdmin, (req, res) =>
    storeController.getAllStores(req, res)
  );

  /**
   * @swagger
   * /api/stores/{id}:
   *   get:
   *     summary: Obtener un store por ID (solo administradores)
   *     tags: [Stores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del store
   *     responses:
   *       200:
   *         description: Store encontrado
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
   *                     id:
   *                       type: integer
   *                     id_store:
   *                       type: integer
   *                     email:
   *                       type: string
   *                     nombre:
   *                       type: string
   *                     apellido:
   *                       type: string
   *                     telefono:
   *                       type: string
   *                     fecha_registro:
   *                       type: string
   *                       format: date-time
   *                     activo:
   *                       type: boolean
   *                     codigo_empleado:
   *                       type: string
   *                     fecha_contratacion:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: ID de store inválido
   *       404:
   *         description: Store no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/stores/:id', authenticateToken, requireAdmin, (req, res) =>
    storeController.getStoreById(req, res)
  );

  /**
   * @swagger
   * /api/stores/{id}:
   *   put:
   *     summary: Actualizar un store (solo administradores)
   *     tags: [Stores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del store
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del store
   *                 example: "store.actualizado@ejemplo.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Nueva contraseña (mínimo 6 caracteres)
   *                 example: "newpassword123"
   *               nombre:
   *                 type: string
   *                 description: Nombre del store
   *                 example: "Juan"
   *               apellido:
   *                 type: string
   *                 description: Apellido del store
   *                 example: "García"
   *               codigo_empleado:
   *                 type: string
   *                 description: Código de empleado único
   *                 example: "S002"
   *               telefono:
   *                 type: string
   *                 description: Teléfono opcional
   *                 example: "+34612345678"
   *               activo:
   *                 type: boolean
   *                 description: Estado del store
   *                 example: false
   *     responses:
   *       200:
   *         description: Store actualizado exitosamente
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
   *                     id:
   *                       type: integer
   *                     id_store:
   *                       type: integer
   *                     email:
   *                       type: string
   *                     nombre:
   *                       type: string
   *                     apellido:
   *                       type: string
   *                     telefono:
   *                       type: string
   *                     fecha_registro:
   *                       type: string
   *                       format: date-time
   *                     activo:
   *                       type: boolean
   *                     codigo_empleado:
   *                       type: string
   *                     fecha_contratacion:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Datos de entrada inválidos
   *       404:
   *         description: Store no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/stores/:id', authenticateToken, requireAdmin, (req, res) =>
    storeController.updateStore(req, res)
  );

  /**
   * @swagger
   * /api/stores/{id}:
   *   delete:
   *     summary: Eliminar un store (solo administradores)
   *     tags: [Stores]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del store
   *     responses:
   *       200:
   *         description: Store eliminado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       400:
   *         description: ID de store inválido
   *       404:
   *         description: Store no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.delete('/stores/:id', authenticateToken, requireAdmin, (req, res) =>
    storeController.deleteStore(req, res)
  );
};

export default storeRoutes;