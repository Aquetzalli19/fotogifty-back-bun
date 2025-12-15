import { Router } from 'express';
import { CategoriaController } from '../controllers/categoria.controller';
import { CrearCategoriaUseCase } from '../../application/use-cases/crear-categoria.use-case';
import { ActualizarCategoriaUseCase } from '../../application/use-cases/actualizar-categoria.use-case';
import { PrismaCategoriaRepository } from '../repositories/prisma-categoria.repository';

/**
 * @swagger
 * tags:
 *   name: Categorías
 *   description: Gestión de categorías de productos
 */

const categoriaRoutes = (router: Router): void => {
  const categoriaRepository = new PrismaCategoriaRepository();
  const crearCategoriaUseCase = new CrearCategoriaUseCase(categoriaRepository);
  const actualizarCategoriaUseCase = new ActualizarCategoriaUseCase(categoriaRepository);
  const categoriaController = new CategoriaController(crearCategoriaUseCase, actualizarCategoriaUseCase, categoriaRepository);

  /**
   * @swagger
   * /api/categorias:
   *   post:
   *     summary: Crear una nueva categoría
   *     tags: [Categorías]
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
   *                 description: Nombre de la categoría
   *                 example: "Calendario"
   *               descripcion:
   *                 type: string
   *                 description: Descripción de la categoría
   *                 example: "Categoría para productos de calendarios"
   *               activo:
   *                 type: boolean
   *                 description: Estado de la categoría
   *                 example: true
   *     responses:
   *       201:
   *         description: Categoría creada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Categoria'
   *       400:
   *         description: Datos de entrada inválidos
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/categorias', (req, res) =>
    categoriaController.crearCategoria(req, res)
  );

  /**
   * @swagger
   * /api/categorias:
   *   get:
   *     summary: Obtener todas las categorías
   *     tags: [Categorías]
   *     responses:
   *       200:
   *         description: Lista de todas las categorías
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
   *                     $ref: '#/components/schemas/Categoria'
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/categorias', (req, res) =>
    categoriaController.getAllCategorias(req, res)
  );

  /**
   * @swagger
   * /api/categorias/{id}:
   *   get:
   *     summary: Obtener una categoría por ID
   *     tags: [Categorías]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la categoría
   *     responses:
   *       200:
   *         description: Categoría encontrada
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Categoria'
   *       400:
   *         description: ID de categoría inválido
   *       404:
   *         description: Categoría no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/categorias/:id', (req, res) =>
    categoriaController.getCategoriaById(req, res)
  );

  /**
   * @swagger
   * /api/categorias/{id}:
   *   put:
   *     summary: Actualizar una categoría
   *     tags: [Categorías]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la categoría
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nombre:
   *                 type: string
   *                 description: Nombre de la categoría
   *                 example: "Calendario Actualizado"
   *               descripcion:
   *                 type: string
   *                 description: Descripción de la categoría
   *                 example: "Categoría actualizada para productos de calendarios"
   *               activo:
   *                 type: boolean
   *                 description: Estado de la categoría
   *                 example: false
   *     responses:
   *       200:
   *         description: Categoría actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Categoria'
   *       400:
   *         description: Datos de entrada inválidos
   *       404:
   *         description: Categoría no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/categorias/:id', (req, res) =>
    categoriaController.updateCategoria(req, res)
  );

  /**
   * @swagger
   * /api/categorias/{id}:
   *   delete:
   *     summary: Eliminar una categoría (cambiar estado a inactivo)
   *     tags: [Categorías]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID de la categoría
   *     responses:
   *       200:
   *         description: Categoría eliminada exitosamente
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
   *         description: ID de categoría inválido
   *       404:
   *         description: Categoría no encontrada
   *       500:
   *         description: Error interno del servidor
   */
  router.delete('/categorias/:id', (req, res) =>
    categoriaController.deleteCategoria(req, res)
  );
};

export default categoriaRoutes;