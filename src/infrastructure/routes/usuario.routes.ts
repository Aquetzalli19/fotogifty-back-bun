import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario.use-case';
import { AceptarTerminosUseCase } from '@application/use-cases/aceptar-terminos.use-case';
import { VerificarPasswordUsuarioUseCase } from '@application/use-cases/verificar-password-usuario.use-case';
import { ActualizarEmailUsuarioUseCase } from '@application/use-cases/actualizar-email-usuario.use-case';
import { EliminarCuentaUsuarioUseCase } from '@application/use-cases/eliminar-cuenta-usuario.use-case';
import { PrismaUsuarioRepository } from '../repositories/prisma-usuario.repository';
import { PrismaAceptacionTerminosRepository } from '../repositories/prisma-aceptacion-terminos.repository';
import { PrismaDocumentoLegalRepository } from '../repositories/prisma-documento-legal.repository';
import { authenticateToken, requireRole, requireCliente, requireAdmin } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */
const usuarioRoutes = (router: Router): void => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const aceptacionTerminosRepository = new PrismaAceptacionTerminosRepository();
  const documentoLegalRepository = new PrismaDocumentoLegalRepository();

  const crearUsuarioUseCase = new CrearUsuarioUseCase(usuarioRepository);
  const aceptarTerminosUseCase = new AceptarTerminosUseCase(
    aceptacionTerminosRepository,
    documentoLegalRepository
  );
  const verificarPasswordUseCase = new VerificarPasswordUsuarioUseCase(usuarioRepository);
  const actualizarEmailUseCase = new ActualizarEmailUsuarioUseCase(usuarioRepository);
  const eliminarCuentaUseCase = new EliminarCuentaUsuarioUseCase(usuarioRepository);

  const usuarioController = new UsuarioController(
    crearUsuarioUseCase,
    usuarioRepository,
    aceptarTerminosUseCase,
    verificarPasswordUseCase,
    actualizarEmailUseCase,
    eliminarCuentaUseCase
  );

  /**
   * @swagger
   * /api/usuarios:
   *   post:
   *     summary: Crear un nuevo usuario
   *     tags: [Usuarios]
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
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del usuario
   *                 example: "usuario@ejemplo.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Contraseña (mínimo 6 caracteres)
   *                 example: "password123"
   *               nombre:
   *                 type: string
   *                 description: Nombre del usuario
   *                 example: "Juan"
   *               apellido:
   *                 type: string
   *                 description: Apellido del usuario
   *                 example: "Pérez"
   *               telefono:
   *                 type: string
   *                 description: Teléfono opcional
   *                 example: "+34612345678"
   *     responses:
   *       201:
   *         description: Usuario creado exitosamente
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
   *       400:
   *         description: Datos de entrada inválidos
   *       409:
   *         description: El usuario ya existe
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/usuarios', (req, res) =>
    usuarioController.crearUsuario(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/admin:
   *   post:
   *     summary: Crear un nuevo administrador
   *     tags: [Usuarios]
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
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "admin@ejemplo.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 example: "password123"
   *               nombre:
   *                 type: string
   *                 example: "Juan"
   *               apellido:
   *                 type: string
   *                 example: "Pérez"
   *               telefono:
   *                 type: string
   *                 example: "+34612345678"
   *               nivel_acceso:
   *                 type: integer
   *                 description: "1 para ADMIN, 2 para SUPER_ADMIN"
   *                 example: 1
   *     responses:
   *       201:
   *         description: Administrador creado exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       409:
   *         description: El usuario ya existe
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/usuarios/admin', (req, res) =>
    usuarioController.crearAdmin(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/store:
   *   post:
   *     summary: Crear un nuevo vendedor de ventanilla
   *     tags: [Usuarios]
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
   *                 example: "vendedor@tienda.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 example: "password123"
   *               nombre:
   *                 type: string
   *                 example: "María"
   *               apellido:
   *                 type: string
   *                 example: "García"
   *               telefono:
   *                 type: string
   *                 example: "+34612345678"
   *               codigo_empleado:
   *                 type: string
   *                 example: "EMP001"
   *     responses:
   *       201:
   *         description: Vendedor de ventanilla creado exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       409:
   *         description: El usuario ya existe
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/usuarios/store', (req, res) =>
    usuarioController.crearStore(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   get:
   *     summary: Obtener un usuario por ID
   *     tags: [Usuarios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Usuario encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/UsuarioResponse'
   *       400:
   *         description: ID de usuario inválido
   *       401:
   *         description: Acceso no autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/usuarios/:id', authenticateToken, (req, res) =>
    usuarioController.getUsuarioById(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   put:
   *     summary: Actualizar información de un usuario
   *     tags: [Usuarios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre del usuario
   *                 example: "Juan"
   *               apellido:
   *                 type: string
   *                 description: Apellido del usuario
   *                 example: "Pérez"
   *               telefono:
   *                 type: string
   *                 description: Teléfono del usuario
   *                 example: "+34612345678"
   *               activo:
   *                 type: boolean
   *                 description: Estado de actividad del usuario
   *                 example: true
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Usuario actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/UsuarioResponse'
   *                 message:
   *                   type: string
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Acceso no autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/usuarios/:id', authenticateToken, (req, res) =>
    usuarioController.updateUsuario(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/{id}/password:
   *   put:
   *     summary: Cambiar contraseña de un usuario
   *     tags: [Usuarios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
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
   *                 example: "password123"
   *               newPassword:
   *                 type: string
   *                 format: password
   *                 description: Nueva contraseña
   *                 example: "newpassword123"
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Contraseña actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/UsuarioResponse'
   *                 message:
   *                   type: string
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Contraseña actual incorrecta o acceso no autorizado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/usuarios/:id/password', authenticateToken, (req, res) =>
    usuarioController.changePassword(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/{id}/verify-password:
   *   post:
   *     summary: Verificar si la contraseña es correcta
   *     tags: [Usuarios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - password
   *             properties:
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Contraseña a verificar
   *                 example: "password123"
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Verificación exitosa
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 valid:
   *                   type: boolean
   *                   description: Indica si la contraseña es válida
   *                   example: true
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Acceso no autorizado
   *       403:
   *         description: Acceso denegado
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/usuarios/:id/verify-password', authenticateToken, (req, res) =>
    usuarioController.verifyPassword(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/{id}/email:
   *   put:
   *     summary: Actualizar email del usuario con verificación de contraseña
   *     tags: [Usuarios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - currentPassword
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Nuevo email
   *                 example: "nuevoemail@ejemplo.com"
   *               currentPassword:
   *                 type: string
   *                 format: password
   *                 description: Contraseña actual para verificación
   *                 example: "password123"
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Email actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/UsuarioResponse'
   *                 message:
   *                   type: string
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: Contraseña incorrecta
   *       403:
   *         description: Acceso denegado
   *       404:
   *         description: Usuario no encontrado
   *       409:
   *         description: El email ya está en uso
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/usuarios/:id/email', authenticateToken, (req, res) =>
    usuarioController.updateEmail(req, res)
  );

  /**
   * @swagger
   * /api/usuarios:
   *   get:
   *     summary: Obtener todos los usuarios
   *     tags: [Usuarios]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de todos los usuarios
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
   *                         format: date-time
   *                       activo:
   *                         type: boolean
   *       401:
   *         description: Acceso no autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/usuarios', authenticateToken, requireAdmin, (req, res) =>
    usuarioController.getAllUsuarios(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/{id}:
   *   delete:
   *     summary: Eliminar cuenta de usuario (anonimización)
   *     description: Elimina la cuenta del usuario autenticado verificando su contraseña y teléfono. La eliminación es irreversible y anonimiza los datos personales preservando la integridad referencial de los pedidos.
   *     tags: [Usuarios]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario a eliminar
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - password
   *               - phoneNumber
   *             properties:
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Contraseña actual del usuario
   *                 example: "miContraseña123"
   *               phoneNumber:
   *                 type: string
   *                 description: Teléfono registrado (9–11 dígitos numéricos)
   *                 example: "612345678"
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Cuenta eliminada correctamente
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
   *                   example: "Cuenta eliminada correctamente"
   *       400:
   *         description: Faltan campos o formato de teléfono inválido
   *       401:
   *         description: Contraseña o teléfono incorrectos
   *       403:
   *         description: El token no corresponde al usuario del path
   *       404:
   *         description: Usuario no encontrado o ya eliminado
   *       409:
   *         description: El usuario tiene pedidos activos
   *       500:
   *         description: Error interno del servidor
   */
  router.delete('/usuarios/:id', authenticateToken, (req, res) =>
    usuarioController.eliminarCuenta(req, res)
  );
};

export default usuarioRoutes;