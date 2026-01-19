import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { PrismaUsuarioRepository } from '../repositories/prisma-usuario.repository';
import { authenticateToken } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints de autenticación
 */
const authRoutes = (router: Router): void => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const loginUseCase = new LoginUseCase(usuarioRepository);
  const authController = new AuthController(loginUseCase, usuarioRepository);

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
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/UsuarioResponse'
   *                     token:
   *                       type: string
   *                       description: Token JWT para autenticación
   *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c3VhcmlvQGVqZW1wbG8uY29tIiwidGlwbyI6ImNsaWVudGUiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
   *                     expiresIn:
   *                       type: number
   *                       description: Tiempo de expiración del token en segundos
   *                       example: 86400
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
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/UsuarioResponse'
   *                     token:
   *                       type: string
   *                       description: Token JWT para autenticación
   *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBhamVtcGxvLmNvbSIsInR5cG8iOiJhZG1pbiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
   *                     expiresIn:
   *                       type: number
   *                       description: Tiempo de expiración del token en segundos
   *                       example: 86400
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Credenciales inválidas
   *       500:
   *         description: Error interno del servidor
   */
  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Obtener información del usuario autenticado
   *     tags: [Autenticación]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Información del usuario obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/UsuarioResponse'
   *       401:
   *         description: Acceso no autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/auth/me', authenticateToken, (req, res) =>
    authController.getMe(req, res)
  );

  router.post('/auth/login/admin', (req, res) =>
    authController.loginAdmin(req, res)
  );

  /**
   * @swagger
   * /api/auth/login/store:
   *   post:
   *     summary: Iniciar sesión como vendedor de ventanilla (store)
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
   *                 description: Email del vendedor de ventanilla
   *                 example: "vendedor@tienda.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Contraseña del vendedor de ventanilla
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
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/UsuarioResponse'
   *                     token:
   *                       type: string
   *                       description: Token JWT para autenticación
   *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                     expiresIn:
   *                       type: number
   *                       description: Tiempo de expiración del token en segundos
   *                       example: 86400
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Credenciales inválidas
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/auth/login/store', (req, res) =>
    authController.loginStore(req, res)
  );

  /**
   * @swagger
   * /api/auth/verificar-identidad:
   *   post:
   *     summary: Verificar identidad del usuario (paso 1 de recuperación de contraseña)
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - telefono
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del usuario
   *                 example: "usuario@ejemplo.com"
   *               telefono:
   *                 type: string
   *                 description: Teléfono registrado (solo dígitos, mínimo 10 caracteres)
   *                 example: "5512345678"
   *     responses:
   *       200:
   *         description: Identidad verificada correctamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Identidad verificada correctamente"
   *       400:
   *         description: Datos de entrada inválidos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Email inválido"
   *       404:
   *         description: Los datos no coinciden con nuestros registros
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Los datos no coinciden con nuestros registros"
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/auth/verificar-identidad', (req, res) =>
    authController.verificarIdentidad(req, res)
  );

  /**
   * @swagger
   * /api/auth/recuperar-password:
   *   post:
   *     summary: Cambiar contraseña después de verificar identidad (paso 2 de recuperación)
   *     tags: [Autenticación]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - telefono
   *               - nueva_password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del usuario
   *                 example: "usuario@ejemplo.com"
   *               telefono:
   *                 type: string
   *                 description: Teléfono registrado (solo dígitos, mínimo 10 caracteres)
   *                 example: "5512345678"
   *               nueva_password:
   *                 type: string
   *                 format: password
   *                 description: Nueva contraseña (mínimo 6 caracteres)
   *                 example: "nuevaContraseña123"
   *     responses:
   *       200:
   *         description: Contraseña cambiada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Contraseña cambiada exitosamente"
   *       400:
   *         description: Datos de entrada inválidos o contraseña muy corta
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "La contraseña debe tener al menos 6 caracteres"
   *       404:
   *         description: Los datos no coinciden con nuestros registros
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Los datos no coinciden con nuestros registros"
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/auth/recuperar-password', (req, res) =>
    authController.recuperarPassword(req, res)
  );
};

export default authRoutes;