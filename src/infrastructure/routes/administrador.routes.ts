import { Router } from 'express';
import { AdministradorController } from '../controllers/administrador.controller';
import { CrearUsuarioUseCase } from '../../application/use-cases/crear-usuario.use-case';
import { PrismaUsuarioRepository } from '../repositories/prisma-usuario.repository';

/**
 * @swagger
 * tags:
 *   name: Administradores
 *   description: Gestión de administradores
 */
const administradorRoutes = (router: Router): void => {
  const usuarioRepository = new PrismaUsuarioRepository();
  const crearUsuarioUseCase = new CrearUsuarioUseCase(usuarioRepository);
  const administradorController = new AdministradorController(crearUsuarioUseCase);

  /**
   * @swagger
   * /api/admin/registro:
   *   post:
   *     summary: Crear un nuevo administrador (admin o super_admin)
   *     tags: [Administradores]
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
   *               - tipo
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email del administrador
   *                 example: "admin@ejemplo.com"
   *               password:
   *                 type: string
   *                 format: password
   *                 description: Contraseña (mínimo 6 caracteres)
   *                 example: "password123"
   *               nombre:
   *                 type: string
   *                 description: Nombre del administrador
   *                 example: "Carlos"
   *               apellido:
   *                 type: string
   *                 description: Apellido del administrador
   *                 example: "García"
   *               telefono:
   *                 type: string
   *                 description: Teléfono opcional
   *                 example: "+34698765432"
   *               tipo:
   *                 type: string
   *                 enum: [admin, super_admin]
   *                 description: Tipo de administrador
   *                 example: "admin"
   *     responses:
   *       201:
   *         description: Administrador creado exitosamente
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
   *         description: Datos de entrada inválidos
   *       409:
   *         description: El administrador ya existe
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/admin/registro', (req, res) =>
    administradorController.crearAdministrador(req, res)
  );
};

export default administradorRoutes;