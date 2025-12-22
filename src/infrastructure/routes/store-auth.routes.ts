import { Router } from 'express';
import { StoreAuthController } from '../controllers/store-auth.controller';
import { PrismaStoreRepository } from '../repositories/prisma-store.repository';
import { ActualizarStoreUseCase } from '@application/use-cases/actualizar-store.use-case';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Store Auth
 *   description: Autenticación y perfil de vendedores (stores)
 */

const storeAuthRoutes = (router: Router): void => {
  const storeRepository = new PrismaStoreRepository();
  const actualizarStoreUseCase = new ActualizarStoreUseCase(storeRepository);
  const storeAuthController = new StoreAuthController(storeRepository, actualizarStoreUseCase);

  /**
   * @swagger
   * /api/auth/store/me:
   *   get:
   *     summary: Obtener perfil del store autenticado
   *     tags: [Store Auth]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil del store obtenido exitosamente
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
   *                     codigo_empleado:
   *                       type: string
   *                     fecha_registro:
   *                       type: string
   *                       format: date-time
   *                     fecha_contratacion:
   *                       type: string
   *                       format: date-time
   *                     activo:
   *                       type: boolean
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No es un usuario store
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/auth/store/me', authenticateToken, requireRole('store'), (req, res) =>
    storeAuthController.getProfile(req, res)
  );

  /**
   * @swagger
   * /api/auth/store/update-profile:
   *   put:
   *     summary: Actualizar perfil del store autenticado
   *     tags: [Store Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre del store
   *                 example: "Juan"
   *               apellido:
   *                 type: string
   *                 description: Apellido del store
   *                 example: "Pérez"
   *               telefono:
   *                 type: string
   *                 description: Teléfono del store
   *                 example: "+34612345678"
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del store
   *                 example: "store@ejemplo.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Nueva contraseña (opcional, mínimo 6 caracteres)
   *                 example: "newpassword123"
   *     responses:
   *       200:
   *         description: Perfil actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No es un usuario store
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/auth/store/update-profile', authenticateToken, requireRole('store'), (req, res) =>
    storeAuthController.updateProfile(req, res)
  );

  /**
   * @swagger
   * /api/auth/store/change-password:
   *   patch:
   *     summary: Cambiar contraseña del store autenticado
   *     tags: [Store Auth]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - currentPassword
   *               - newPassword
   *             properties:
   *               currentPassword:
   *                 type: string
   *                 format: password
   *                 description: Contraseña actual
   *                 example: "oldpassword123"
   *               newPassword:
   *                 type: string
   *                 format: password
   *                 description: Nueva contraseña (mínimo 6 caracteres)
   *                 example: "newpassword123"
   *     responses:
   *       200:
   *         description: Contraseña cambiada exitosamente
   *       400:
   *         description: Contraseña actual incorrecta o nueva contraseña inválida
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No es un usuario store
   *       500:
   *         description: Error interno del servidor
   */
  router.patch('/auth/store/change-password', authenticateToken, requireRole('store'), (req, res) =>
    storeAuthController.changePassword(req, res)
  );
};

export default storeAuthRoutes;
