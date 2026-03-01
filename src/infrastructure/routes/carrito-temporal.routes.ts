import { Router } from 'express';
import multer from 'multer';
import { CarritoTemporalController } from '@infrastructure/controllers/carrito-temporal.controller';
import { CustomizacionTemporalController } from '@infrastructure/controllers/customizacion-temporal.controller';
import { ImagenTemporalController } from '@infrastructure/controllers/imagen-temporal.controller';
import { ObtenerCarritoTemporalUseCase } from '@application/use-cases/obtener-carrito-temporal.use-case';
import { GuardarCarritoTemporalUseCase } from '@application/use-cases/guardar-carrito-temporal.use-case';
import { EliminarCarritoTemporalUseCase } from '@application/use-cases/eliminar-carrito-temporal.use-case';
import { ObtenerCustomizacionesTemporalesUseCase } from '@application/use-cases/obtener-customizaciones-temporales.use-case';
import { GuardarCustomizacionTemporalUseCase } from '@application/use-cases/guardar-customizacion-temporal.use-case';
import { EliminarCustomizacionTemporalUseCase } from '@application/use-cases/eliminar-customizacion-temporal.use-case';
import { EliminarTodasCustomizacionesTemporalesUseCase } from '@application/use-cases/eliminar-todas-customizaciones-temporales.use-case';
import { DuplicarCustomizacionTemporalUseCase } from '@application/use-cases/duplicar-customizacion-temporal.use-case';
import { SubirImagenTemporalUseCase } from '@application/use-cases/subir-imagen-temporal.use-case';
import { ObtenerUrlImagenTemporalUseCase } from '@application/use-cases/obtener-url-imagen-temporal.use-case';
import { EliminarImagenTemporalUseCase } from '@application/use-cases/eliminar-imagen-temporal.use-case';
import { EliminarTodasImagenesTemporalesUseCase } from '@application/use-cases/eliminar-todas-imagenes-temporales.use-case';
import { GenerarPresignedUrlUseCase } from '@application/use-cases/generar-presigned-url.use-case';
import { EliminarImagenTemporalPorKeyUseCase } from '@application/use-cases/eliminar-imagen-temporal-por-key.use-case';
import { PrismaCarritoTemporalRepository } from '@infrastructure/repositories/prisma-carrito-temporal.repository';
import { PrismaCustomizacionTemporalRepository } from '@infrastructure/repositories/prisma-customizacion-temporal.repository';
import { PrismaImagenTemporalRepository } from '@infrastructure/repositories/prisma-imagen-temporal.repository';
import { S3Service } from '@infrastructure/services/s3.service';
import { authenticateToken } from '@infrastructure/middlewares/auth.middleware';

// Configurar Multer para imágenes temporales
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

/**
 * @swagger
 * tags:
 *   name: Carrito Temporal
 *   description: Gestión de carritos y customizaciones temporales por usuario
 */

const carritoTemporalRoutes = (router: Router): void => {
  // Repositories
  const carritoRepo = new PrismaCarritoTemporalRepository();
  const customizacionRepo = new PrismaCustomizacionTemporalRepository();
  const imagenRepo = new PrismaImagenTemporalRepository();
  const s3Service = new S3Service();

  // Use Cases - Carrito
  const obtenerCarritoUseCase = new ObtenerCarritoTemporalUseCase(carritoRepo);
  const guardarCarritoUseCase = new GuardarCarritoTemporalUseCase(carritoRepo);
  const eliminarCarritoUseCase = new EliminarCarritoTemporalUseCase(carritoRepo);

  // Use Cases - Customizaciones
  const obtenerCustomizacionesUseCase = new ObtenerCustomizacionesTemporalesUseCase(customizacionRepo);
  const guardarCustomizacionUseCase = new GuardarCustomizacionTemporalUseCase(customizacionRepo);
  const eliminarCustomizacionUseCase = new EliminarCustomizacionTemporalUseCase(customizacionRepo);
  const eliminarTodasCustomizacionesUseCase = new EliminarTodasCustomizacionesTemporalesUseCase(customizacionRepo);
  const duplicarCustomizacionUseCase = new DuplicarCustomizacionTemporalUseCase(customizacionRepo);

  // Use Cases - Imágenes
  const subirImagenUseCase = new SubirImagenTemporalUseCase(imagenRepo, s3Service);
  const obtenerUrlImagenUseCase = new ObtenerUrlImagenTemporalUseCase(imagenRepo, s3Service);
  const eliminarImagenUseCase = new EliminarImagenTemporalUseCase(imagenRepo);
  const eliminarTodasImagenesUseCase = new EliminarTodasImagenesTemporalesUseCase(imagenRepo);
  const generarPresignedUrlUseCase = new GenerarPresignedUrlUseCase(imagenRepo, s3Service);
  const eliminarImagenPorKeyUseCase = new EliminarImagenTemporalPorKeyUseCase(imagenRepo, s3Service);

  // Controllers
  const carritoController = new CarritoTemporalController(
    obtenerCarritoUseCase,
    guardarCarritoUseCase,
    eliminarCarritoUseCase
  );

  const customizacionController = new CustomizacionTemporalController(
    obtenerCustomizacionesUseCase,
    guardarCustomizacionUseCase,
    eliminarCustomizacionUseCase,
    eliminarTodasCustomizacionesUseCase,
    duplicarCustomizacionUseCase
  );

  const imagenController = new ImagenTemporalController(
    subirImagenUseCase,
    obtenerUrlImagenUseCase,
    eliminarImagenUseCase,
    eliminarTodasImagenesUseCase,
    generarPresignedUrlUseCase,
    eliminarImagenPorKeyUseCase
  );

  // ============================================
  // CARRITO TEMPORAL
  // ============================================

  /**
   * @swagger
   * /api/cart/temp:
   *   get:
   *     summary: Obtener carrito temporal del usuario
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Carrito obtenido exitosamente
   *       401:
   *         description: No autenticado
   */
  router.get('/cart/temp', authenticateToken, (req, res) =>
    carritoController.obtener(req, res)
  );

  /**
   * @swagger
   * /api/cart/temp:
   *   put:
   *     summary: Guardar/actualizar carrito temporal
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *     responses:
   *       200:
   *         description: Carrito guardado exitosamente
   */
  router.put('/cart/temp', authenticateToken, (req, res) =>
    carritoController.guardar(req, res)
  );

  /**
   * @swagger
   * /api/cart/temp:
   *   delete:
   *     summary: Eliminar carrito temporal
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Carrito eliminado exitosamente
   */
  router.delete('/cart/temp', authenticateToken, (req, res) =>
    carritoController.eliminar(req, res)
  );

  // ============================================
  // CUSTOMIZACIONES TEMPORALES
  // ============================================

  /**
   * @swagger
   * /api/customizations/temp:
   *   get:
   *     summary: Obtener todas las customizaciones del usuario
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Customizaciones obtenidas exitosamente
   */
  router.get('/customizations/temp', authenticateToken, (req, res) =>
    customizacionController.obtenerTodas(req, res)
  );

  /**
   * @swagger
   * /api/customizations/temp/{cartItemId}/{instanceIndex}:
   *   put:
   *     summary: Guardar/actualizar customización
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: cartItemId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: instanceIndex
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
   *               editorType:
   *                 type: string
   *                 enum: [standard, calendar, polaroid]
   *               data:
   *                 type: object
   *               completed:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Customización guardada exitosamente
   */
  router.put('/customizations/temp/:cartItemId/:instanceIndex', authenticateToken, (req, res) =>
    customizacionController.guardar(req, res)
  );

  /**
   * @swagger
   * /api/customizations/temp/{cartItemId}/duplicate:
   *   post:
   *     summary: Duplicar una customización temporal
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: cartItemId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del ítem del carrito
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sourceInstanceIndex
   *             properties:
   *               sourceInstanceIndex:
   *                 type: integer
   *                 minimum: 0
   *                 description: Índice de la customización fuente
   *               targetInstanceIndex:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 99
   *                 description: Índice de destino (opcional; si se omite se asigna automáticamente)
   *     responses:
   *       201:
   *         description: Customización duplicada exitosamente
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
   *                     cartItemId:
   *                       type: string
   *                     sourceInstanceIndex:
   *                       type: integer
   *                     targetInstanceIndex:
   *                       type: integer
   *                     editorType:
   *                       type: string
   *                     completed:
   *                       type: boolean
   *                     createdAt:
   *                       type: string
   *                       format: date-time
   *                 message:
   *                   type: string
   *       400:
   *         description: Error de validación o límite de instancias superado
   *       404:
   *         description: Customización fuente no encontrada
   *       409:
   *         description: Ya existe una customización en el índice de destino
   */
  router.post('/customizations/temp/:cartItemId/duplicate', authenticateToken, (req, res) =>
    customizacionController.duplicar(req, res)
  );

  /**
   * @swagger
   * /api/customizations/temp/{cartItemId}/{instanceIndex}:
   *   delete:
   *     summary: Eliminar customización específica
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: cartItemId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: instanceIndex
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Customización eliminada
   */
  router.delete('/customizations/temp/:cartItemId/:instanceIndex', authenticateToken, (req, res) =>
    customizacionController.eliminar(req, res)
  );

  /**
   * @swagger
   * /api/customizations/temp:
   *   delete:
   *     summary: Eliminar TODAS las customizaciones del usuario
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Customizaciones eliminadas
   */
  router.delete('/customizations/temp', authenticateToken, (req, res) =>
    customizacionController.eliminarTodas(req, res)
  );

  // ============================================
  // IMÁGENES TEMPORALES
  // ============================================

  /**
   * @swagger
   * /api/images/temp/presigned-url:
   *   post:
   *     summary: Generar URL prefirmada para subida directa a S3
   *     description: >
   *       Genera una presigned PUT URL para que el cliente suba la imagen directamente a S3.
   *       Crea el registro en la base de datos con la URL pública conocida.
   *       El cliente debe luego hacer PUT a uploadUrl con el header Content-Type correcto.
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [filename, contentType, sizeBytes]
   *             properties:
   *               filename:
   *                 type: string
   *                 example: foto.jpg
   *               contentType:
   *                 type: string
   *                 enum: [image/jpeg, image/png, image/webp, image/heic]
   *               sizeBytes:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 25000000
   *                 example: 2048000
   *     responses:
   *       200:
   *         description: URL prefirmada generada exitosamente
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
   *                     uploadUrl:
   *                       type: string
   *                       description: URL prefirmada para hacer PUT directo a S3 (expira en 1 hora)
   *                     s3Key:
   *                       type: string
   *                       example: temp/123/1700000000000-uuid.jpg
   *                     publicUrl:
   *                       type: string
   *                       description: URL pública del objeto una vez subido
   *                     expiresAt:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: contentType no permitido o sizeBytes fuera de rango
   *       401:
   *         description: No autenticado
   */
  router.post('/images/temp/presigned-url', authenticateToken, (req, res) =>
    imagenController.generarPresignedUrl(req, res)
  );

  /**
   * @swagger
   * /api/images/temp/by-key:
   *   delete:
   *     summary: Eliminar imagen temporal por clave S3
   *     description: >
   *       Elimina el objeto de S3 y su registro en la base de datos usando la s3Key.
   *       La clave debe pertenecer al usuario autenticado (validado por prefijo temp/{userId}/).
   *       Es idempotente: no falla si el objeto ya no existe en S3 o en DB.
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [s3Key]
   *             properties:
   *               s3Key:
   *                 type: string
   *                 example: temp/123/1700000000000-uuid.jpg
   *     responses:
   *       200:
   *         description: Imagen eliminada correctamente
   *       401:
   *         description: No autenticado
   *       403:
   *         description: La clave no pertenece al usuario autenticado
   */
  router.delete('/images/temp/by-key', authenticateToken, (req, res) =>
    imagenController.eliminarPorKey(req, res)
  );

  /**
   * @swagger
   * /api/images/temp:
   *   post:
   *     summary: Subir imagen temporal a S3
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Imagen subida exitosamente
   */
  router.post('/images/temp', authenticateToken, upload.single('file'), (req, res) =>
    imagenController.subir(req, res)
  );

  /**
   * @swagger
   * /api/images/temp/{imageId}/url:
   *   get:
   *     summary: Obtener URL firmada para imagen temporal
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: imageId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: URL obtenida exitosamente
   *       403:
   *         description: Acceso denegado
   */
  router.get('/images/temp/:imageId/url', authenticateToken, (req, res) =>
    imagenController.obtenerUrl(req, res)
  );

  /**
   * @swagger
   * /api/images/temp/{imageId}:
   *   delete:
   *     summary: Eliminar imagen temporal específica
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: imageId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Imagen eliminada
   */
  router.delete('/images/temp/:imageId', authenticateToken, (req, res) =>
    imagenController.eliminar(req, res)
  );

  /**
   * @swagger
   * /api/images/temp:
   *   delete:
   *     summary: Eliminar TODAS las imágenes temporales del usuario
   *     tags: [Carrito Temporal]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Imágenes eliminadas
   */
  router.delete('/images/temp', authenticateToken, (req, res) =>
    imagenController.eliminarTodas(req, res)
  );
};

export default carritoTemporalRoutes;
