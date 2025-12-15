import { Router } from 'express';
import { PaqueteController } from '../controllers/paquete.controller';
import { CrearPaqueteUseCase } from '../../application/use-cases/crear-paquete.use-case';
import { ActualizarPaqueteUseCase } from '../../application/use-cases/actualizar-paquete.use-case';
import { PrismaPaqueteRepository } from '../repositories/prisma-paquete.repository';
import { PrismaCategoriaRepository } from '../repositories/prisma-categoria.repository';

/**
 * @swagger
 * tags:
 *   name: Paquetes
 *   description: Gestión de paquetes de impresión de fotos
 */

const paqueteRoutes = (router: Router): void => {
  const paqueteRepository = new PrismaPaqueteRepository();
  const categoriaRepository = new PrismaCategoriaRepository();
  const crearPaqueteUseCase = new CrearPaqueteUseCase(paqueteRepository, categoriaRepository);
  const actualizarPaqueteUseCase = new ActualizarPaqueteUseCase(paqueteRepository, categoriaRepository);
  const paqueteController = new PaqueteController(crearPaqueteUseCase, actualizarPaqueteUseCase, paqueteRepository, categoriaRepository);

  /**
   * @swagger
   * /api/paquetes:
   *   post:
   *     summary: Crear un nuevo paquete
   *     tags: [Paquetes]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre
   *               - cantidad_fotos
   *               - precio
   *               - estado
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre del paquete
   *                 example: "Paquete Básico"
   *               categoria_id:
   *                 type: integer
   *                 description: ID de la categoría a la que pertenece el paquete
   *                 example: 1
   *               descripcion:
   *                 type: string
   *                 description: Descripción del paquete
   *                 example: "Incluye 10 fotos impresas"
   *               cantidad_fotos:
   *                 type: integer
   *                 description: Cantidad de fotos incluidas en el paquete
   *                 example: 10
   *               precio:
   *                 type: number
   *                 format: decimal
   *                 description: Precio del paquete
   *                 example: 299.99
   *               estado:
   *                 type: boolean
   *                 description: Estado del paquete (Activo/Inactivo)
   *                 example: true
   *               resolucion_foto:
   *                 type: integer
   *                 description: Resolución de las fotos en píxeles
   *                 example: 300
   *               ancho_foto:
   *                 type: number
   *                 format: decimal
   *                 description: Ancho de las fotos en pulgadas
   *                 example: 10.16
   *               alto_foto:
   *                 type: number
   *                 format: decimal
   *                 description: Alto de las fotos en pulgadas
   *                 example: 15.24
   *     responses:
   *       201:
   *         description: Paquete creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/PaquetePredefinido'
   *       400:
   *         description: Datos de entrada inválidos
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/paquetes', (req, res) =>
    paqueteController.crearPaquete(req, res)
  );

  /**
   * @swagger
   * /api/paquetes:
   *   get:
   *     summary: Obtener todos los paquetes con filtro opcional por estado
   *     tags: [Paquetes]
   *     parameters:
   *       - in: query
   *         name: estado
   *         required: false
   *         schema:
   *           type: string
   *           enum: [true, false]
   *         description: Filtrar paquetes por estado (activo/inactivo). Si no se proporciona, se devuelven todos los paquetes.
   *     responses:
   *       200:
   *         description: Lista de paquetes (filtrada o completa según parámetro)
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
   *                     $ref: '#/components/schemas/PaquetePredefinido'
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/paquetes', (req, res) =>
    paqueteController.getAllPaquetes(req, res)
  );

  /**
   * @swagger
   * /api/paquetes/{id}:
   *   get:
   *     summary: Obtener un paquete por ID
   *     tags: [Paquetes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del paquete
   *     responses:
   *       200:
   *         description: Paquete encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/PaquetePredefinido'
   *       400:
   *         description: ID de paquete inválido
   *       404:
   *         description: Paquete no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/paquetes/:id', (req, res) =>
    paqueteController.getPaqueteById(req, res)
  );

  /**
   * @swagger
   * /api/paquetes/{id}:
   *   put:
   *     summary: Actualizar un paquete
   *     tags: [Paquetes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del paquete
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre del paquete
   *                 example: "Paquete Básico Actualizado"
   *               categoria_id:
   *                 type: integer
   *                 description: ID de la categoría a la que pertenece el paquete
   *                 example: 1
   *               descripcion:
   *                 type: string
   *                 description: Descripción del paquete
   *                 example: "Incluye 10 fotos impresas de alta calidad"
   *               cantidad_fotos:
   *                 type: integer
   *                 description: Cantidad de fotos incluidas en el paquete
   *                 example: 15
   *               precio:
   *                 type: number
   *                 format: decimal
   *                 description: Precio del paquete
   *                 example: 399.99
   *               estado:
   *                 type: boolean
   *                 description: Estado del paquete (Activo/Inactivo)
   *                 example: false
   *               resolucion_foto:
   *                 type: integer
   *                 description: Resolución de las fotos en píxeles
   *                 example: 300
   *               ancho_foto:
   *                 type: number
   *                 format: decimal
   *                 description: Ancho de las fotos en pulgadas
   *                 example: 10.16
   *               alto_foto:
   *                 type: number
   *                 format: decimal
   *                 description: Alto de las fotos en pulgadas
   *                 example: 15.24
   *     responses:
   *       200:
   *         description: Paquete actualizado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/PaquetePredefinido'
   *       400:
   *         description: Datos de entrada inválidos
   *       404:
   *         description: Paquete no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/paquetes/:id', (req, res) =>
    paqueteController.updatePaquete(req, res)
  );

  /**
   * @swagger
   * /api/paquetes/{id}:
   *   delete:
   *     summary: Eliminar un paquete (cambiar estado a inactivo)
   *     tags: [Paquetes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del paquete
   *     responses:
   *       200:
   *         description: Paquete eliminado exitosamente
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
   *         description: ID de paquete inválido
   *       404:
   *         description: Paquete no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.delete('/paquetes/:id', (req, res) =>
    paqueteController.deletePaquete(req, res)
  );

  /**
   * @swagger
   * /api/paquetes/categoria/{categoriaId}:
   *   get:
   *     summary: Obtener paquetes por categoría
   *     tags: [Paquetes]
   *     parameters:
   *       - in: path
   *         name: categoriaId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la categoría
   *     responses:
   *       200:
   *         description: Lista de paquetes de la categoría
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
   *                     $ref: '#/components/schemas/PaquetePredefinido'
   *       400:
   *         description: ID de categoría inválido
   *       404:
   *         description: Categoría no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/paquetes/categoria/:categoriaId', (req, res) =>
    paqueteController.getPaquetesByCategoria(req, res)
  );
};

export default paqueteRoutes;