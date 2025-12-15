import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { PrismaUsuarioRepository } from '../repositories/prisma-usuario.repository';

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints de autenticación
 */
const authRoutes = (router: Router): void => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const loginUseCase = new LoginUseCase(usuarioRepository);
  const authController = new AuthController(loginUseCase);

  /**
   * @swagger
   * /api/auth/login/cliente:
   *   post:
   *     summary: Iniciar sesión como cliente
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del cliente
   *                 example: "cliente@ejemplo.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Contraseña del cliente
   *                 example: "password123"
   *     responses:
   *       200:
   *         description: Login exitoso
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
   *                   $ref: '#/components/schemas/UsuarioResponse'
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Credenciales inválidas
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/auth/login/cliente', (req, res) => 
    authController.loginCliente(req, res)
  );

  /**
   * @swagger
   * /api/auth/login/admin:
   *   post:
   *     summary: Iniciar sesión como administrador
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del administrador
   *                 example: "admin@ejemplo.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Contraseña del administrador
   *                 example: "password123"
   *     responses:
   *       200:
   *         description: Login exitoso
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
   *                   $ref: '#/components/schemas/UsuarioResponse'
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Credenciales inválidas
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/auth/login/admin', (req, res) => 
    authController.loginAdmin(req, res)
  );
};

export default authRoutes;