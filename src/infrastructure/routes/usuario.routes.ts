import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario.use-case';
import { PrismaUsuarioRepository } from '../repositories/prisma-usuario.repository';

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */
const usuarioRoutes = (router: Router): void => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const crearUsuarioUseCase = new CrearUsuarioUseCase(usuarioRepository);
  const usuarioController = new UsuarioController(crearUsuarioUseCase, usuarioRepository);

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
   * /api/usuarios:
   *   get:
   *     summary: Obtener todos los usuarios
   *     tags: [Usuarios]
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
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/usuarios', (req, res) =>
    usuarioController.getAllUsuarios(req, res)
  );
};

export default usuarioRoutes;