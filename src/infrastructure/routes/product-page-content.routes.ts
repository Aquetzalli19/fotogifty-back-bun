import { Router } from 'express';
import multer from 'multer';
import { ProductPageContentController } from '@infrastructure/controllers/product-page-content.controller';
import { ObtenerSeccionesProductPageUseCase } from '@application/use-cases/obtener-secciones-product-page.use-case';
import { ObtenerSeccionProductPageUseCase } from '@application/use-cases/obtener-seccion-product-page.use-case';
import { ActualizarSeccionProductPageUseCase } from '@application/use-cases/actualizar-seccion-product-page.use-case';
import { ToggleSeccionProductPageUseCase } from '@application/use-cases/toggle-seccion-product-page.use-case';
import { CrearSlideProductPageUseCase } from '@application/use-cases/crear-slide-product-page.use-case';
import { ActualizarSlideProductPageUseCase } from '@application/use-cases/actualizar-slide-product-page.use-case';
import { EliminarSlideProductPageUseCase } from '@application/use-cases/eliminar-slide-product-page.use-case';
import { ReordenarSlidesProductPageUseCase } from '@application/use-cases/reordenar-slides-product-page.use-case';
import { CrearOptionProductPageUseCase } from '@application/use-cases/crear-option-product-page.use-case';
import { ActualizarOptionProductPageUseCase } from '@application/use-cases/actualizar-option-product-page.use-case';
import { EliminarOptionProductPageUseCase } from '@application/use-cases/eliminar-option-product-page.use-case';
import { ReordenarOptionsProductPageUseCase } from '@application/use-cases/reordenar-options-product-page.use-case';
import { SubirImagenProductPageUseCase } from '@application/use-cases/subir-imagen-product-page.use-case';
import { PrismaProductPageSectionRepository } from '@infrastructure/repositories/prisma-product-page-section.repository';
import { PrismaProductPageSlideRepository } from '@infrastructure/repositories/prisma-product-page-slide.repository';
import { PrismaProductPageOptionRepository } from '@infrastructure/repositories/prisma-product-page-option.repository';
import { S3Service } from '@infrastructure/services/s3.service';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
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
 *   name: Product Page Content
 *   description: Gestión del contenido CMS de la Página de Producto
 */

const productPageContentRoutes = (router: Router): void => {
  const sectionRepository = new PrismaProductPageSectionRepository();
  const slideRepository = new PrismaProductPageSlideRepository();
  const optionRepository = new PrismaProductPageOptionRepository();
  const s3Service = new S3Service();

  const controller = new ProductPageContentController(
    new ObtenerSeccionesProductPageUseCase(sectionRepository, slideRepository, optionRepository),
    new ObtenerSeccionProductPageUseCase(sectionRepository, slideRepository, optionRepository),
    new ActualizarSeccionProductPageUseCase(sectionRepository),
    new ToggleSeccionProductPageUseCase(sectionRepository),
    new CrearSlideProductPageUseCase(slideRepository, sectionRepository),
    new ActualizarSlideProductPageUseCase(slideRepository),
    new EliminarSlideProductPageUseCase(slideRepository),
    new ReordenarSlidesProductPageUseCase(slideRepository, sectionRepository),
    new CrearOptionProductPageUseCase(optionRepository, sectionRepository),
    new ActualizarOptionProductPageUseCase(optionRepository),
    new EliminarOptionProductPageUseCase(optionRepository),
    new ReordenarOptionsProductPageUseCase(optionRepository, sectionRepository),
    new SubirImagenProductPageUseCase(s3Service)
  );

  // ============================================
  // SECCIONES
  // ============================================

  /**
   * @swagger
   * /api/product-page-content/sections:
   *   get:
   *     summary: Obtener todas las secciones de la página de producto (público)
   *     tags: [Product Page Content]
   *     responses:
   *       200:
   *         description: Secciones obtenidas exitosamente
   */
  router.get('/product-page-content/sections', (req, res) =>
    controller.getAllSections(req, res)
  );

  /**
   * @swagger
   * /api/product-page-content/sections/{sectionKey}:
   *   get:
   *     summary: Obtener una sección específica (público)
   *     tags: [Product Page Content]
   *     parameters:
   *       - in: path
   *         name: sectionKey
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Sección obtenida exitosamente
   *       404:
   *         description: Sección no encontrada
   */
  router.get('/product-page-content/sections/:sectionKey', (req, res) =>
    controller.getSectionByKey(req, res)
  );

  /**
   * @swagger
   * /api/product-page-content/sections/{sectionKey}:
   *   put:
   *     summary: Actualizar una sección (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sectionKey
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               titulo:
   *                 type: string
   *               subtitulo:
   *                 type: string
   *               descripcion:
   *                 type: string
   *               imagen_principal_url:
   *                 type: string
   *               activo:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Sección actualizada exitosamente
   *       404:
   *         description: Sección no encontrada
   */
  router.put('/product-page-content/sections/:sectionKey', authenticateToken, requireAdmin, (req, res) =>
    controller.updateSection(req, res)
  );

  /**
   * @swagger
   * /api/product-page-content/sections/{sectionKey}/toggle:
   *   patch:
   *     summary: Activar/desactivar una sección (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: sectionKey
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Estado cambiado exitosamente
   */
  router.patch('/product-page-content/sections/:sectionKey/toggle', authenticateToken, requireAdmin, (req, res) =>
    controller.toggleSection(req, res)
  );

  // ============================================
  // SLIDES
  // ============================================

  /**
   * @swagger
   * /api/product-page-content/slides:
   *   post:
   *     summary: Crear un nuevo slide (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - section_key
   *               - tipo
   *             properties:
   *               section_key:
   *                 type: string
   *               tipo:
   *                 type: string
   *                 enum: [gallery_image, value_card, paper_type, service_card, product_type]
   *               titulo:
   *                 type: string
   *               descripcion:
   *                 type: string
   *               imagen_url:
   *                 type: string
   *               icono:
   *                 type: string
   *               orden:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Slide creado exitosamente
   */
  router.post('/product-page-content/slides', authenticateToken, requireAdmin, (req, res) =>
    controller.createSlide(req, res)
  );

  /**
   * @swagger
   * /api/product-page-content/slides/reorder:
   *   put:
   *     summary: Reordenar slides de una sección (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - section_key
   *               - slide_ids
   *             properties:
   *               section_key:
   *                 type: string
   *               slide_ids:
   *                 type: array
   *                 items:
   *                   type: integer
   *     responses:
   *       200:
   *         description: Slides reordenados exitosamente
   */
  router.put('/product-page-content/slides/reorder', authenticateToken, requireAdmin, (req, res) =>
    controller.reorderSlides(req, res)
  );

  /**
   * @swagger
   * /api/product-page-content/slides/{id}:
   *   put:
   *     summary: Actualizar un slide (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Slide actualizado exitosamente
   *       404:
   *         description: Slide no encontrado
   */
  router.put('/product-page-content/slides/:id', authenticateToken, requireAdmin, (req, res) =>
    controller.updateSlide(req, res)
  );

  /**
   * @swagger
   * /api/product-page-content/slides/{id}:
   *   delete:
   *     summary: Eliminar un slide (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Slide eliminado exitosamente
   *       404:
   *         description: Slide no encontrado
   */
  router.delete('/product-page-content/slides/:id', authenticateToken, requireAdmin, (req, res) =>
    controller.deleteSlide(req, res)
  );

  // ============================================
  // OPTIONS
  // ============================================

  /**
   * @swagger
   * /api/product-page-content/options:
   *   post:
   *     summary: Crear una nueva opción (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - section_key
   *               - texto
   *             properties:
   *               section_key:
   *                 type: string
   *               slide_id:
   *                 type: integer
   *               texto:
   *                 type: string
   *               texto_secundario:
   *                 type: string
   *               texto_terciario:
   *                 type: string
   *               texto_cuarto:
   *                 type: string
   *               texto_quinto:
   *                 type: string
   *               orden:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Opción creada exitosamente
   */
  router.post('/product-page-content/options', authenticateToken, requireAdmin, (req, res) =>
    controller.createOption(req, res)
  );

  /**
   * @swagger
   * /api/product-page-content/options/reorder:
   *   put:
   *     summary: Reordenar opciones de una sección (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - section_key
   *               - option_ids
   *             properties:
   *               section_key:
   *                 type: string
   *               option_ids:
   *                 type: array
   *                 items:
   *                   type: integer
   *     responses:
   *       200:
   *         description: Opciones reordenadas exitosamente
   */
  router.put('/product-page-content/options/reorder', authenticateToken, requireAdmin, (req, res) =>
    controller.reorderOptions(req, res)
  );

  /**
   * @swagger
   * /api/product-page-content/options/{id}:
   *   put:
   *     summary: Actualizar una opción (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Opción actualizada exitosamente
   *       404:
   *         description: Opción no encontrada
   */
  router.put('/product-page-content/options/:id', authenticateToken, requireAdmin, (req, res) =>
    controller.updateOption(req, res)
  );

  /**
   * @swagger
   * /api/product-page-content/options/{id}:
   *   delete:
   *     summary: Eliminar una opción (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Opción eliminada exitosamente
   */
  router.delete('/product-page-content/options/:id', authenticateToken, requireAdmin, (req, res) =>
    controller.deleteOption(req, res)
  );

  // ============================================
  // UPLOAD
  // ============================================

  /**
   * @swagger
   * /api/product-page-content/upload:
   *   post:
   *     summary: Subir imagen para página de producto (solo administradores)
   *     tags: [Product Page Content]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - section_key
   *               - image_type
   *               - imagen
   *             properties:
   *               section_key:
   *                 type: string
   *               image_type:
   *                 type: string
   *                 enum: [main, slide]
   *               imagen:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Imagen subida exitosamente
   */
  router.post('/product-page-content/upload', authenticateToken, requireAdmin, upload.single('imagen'), (req, res) =>
    controller.uploadImage(req, res)
  );
};

export default productPageContentRoutes;
