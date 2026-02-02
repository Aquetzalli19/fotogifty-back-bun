import { Router } from 'express';
import { LandingContentController } from '@infrastructure/controllers/landing-content.controller';
import { ObtenerSeccionesLandingUseCase } from '@application/use-cases/obtener-secciones-landing.use-case';
import { ObtenerSeccionLandingUseCase } from '@application/use-cases/obtener-seccion-landing.use-case';
import { ActualizarSeccionLandingUseCase } from '@application/use-cases/actualizar-seccion-landing.use-case';
import { CrearSlideLandingUseCase } from '@application/use-cases/crear-slide-landing.use-case';
import { ActualizarSlideLandingUseCase } from '@application/use-cases/actualizar-slide-landing.use-case';
import { EliminarSlideLandingUseCase } from '@application/use-cases/eliminar-slide-landing.use-case';
import { ReordenarSlidesLandingUseCase } from '@application/use-cases/reordenar-slides-landing.use-case';
import { CrearOptionLandingUseCase } from '@application/use-cases/crear-option-landing.use-case';
import { ActualizarOptionLandingUseCase } from '@application/use-cases/actualizar-option-landing.use-case';
import { EliminarOptionLandingUseCase } from '@application/use-cases/eliminar-option-landing.use-case';
import { ReordenarOptionsLandingUseCase } from '@application/use-cases/reordenar-options-landing.use-case';
import { PrismaLandingSectionRepository } from '@infrastructure/repositories/prisma-landing-section.repository';
import { PrismaLandingSlideRepository } from '@infrastructure/repositories/prisma-landing-slide.repository';
import { PrismaLandingOptionRepository } from '@infrastructure/repositories/prisma-landing-option.repository';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Landing Content
 *   description: Gestión del contenido CMS de la Landing Page
 */

const landingContentRoutes = (router: Router): void => {
  // Repositories
  const landingSectionRepository = new PrismaLandingSectionRepository();
  const landingSlideRepository = new PrismaLandingSlideRepository();
  const landingOptionRepository = new PrismaLandingOptionRepository();

  // Use Cases
  const obtenerSeccionesLandingUseCase = new ObtenerSeccionesLandingUseCase(
    landingSectionRepository,
    landingSlideRepository,
    landingOptionRepository
  );
  const obtenerSeccionLandingUseCase = new ObtenerSeccionLandingUseCase(
    landingSectionRepository,
    landingSlideRepository,
    landingOptionRepository
  );
  const actualizarSeccionLandingUseCase = new ActualizarSeccionLandingUseCase(landingSectionRepository);
  const crearSlideLandingUseCase = new CrearSlideLandingUseCase(landingSlideRepository, landingSectionRepository);
  const actualizarSlideLandingUseCase = new ActualizarSlideLandingUseCase(landingSlideRepository);
  const eliminarSlideLandingUseCase = new EliminarSlideLandingUseCase(landingSlideRepository);
  const reordenarSlidesLandingUseCase = new ReordenarSlidesLandingUseCase(landingSlideRepository, landingSectionRepository);
  const crearOptionLandingUseCase = new CrearOptionLandingUseCase(landingOptionRepository, landingSectionRepository);
  const actualizarOptionLandingUseCase = new ActualizarOptionLandingUseCase(landingOptionRepository);
  const eliminarOptionLandingUseCase = new EliminarOptionLandingUseCase(landingOptionRepository);
  const reordenarOptionsLandingUseCase = new ReordenarOptionsLandingUseCase(landingOptionRepository, landingSectionRepository);

  // Controller
  const landingContentController = new LandingContentController(
    obtenerSeccionesLandingUseCase,
    obtenerSeccionLandingUseCase,
    actualizarSeccionLandingUseCase,
    crearSlideLandingUseCase,
    actualizarSlideLandingUseCase,
    eliminarSlideLandingUseCase,
    reordenarSlidesLandingUseCase,
    crearOptionLandingUseCase,
    actualizarOptionLandingUseCase,
    eliminarOptionLandingUseCase,
    reordenarOptionsLandingUseCase
  );

  // ============================================
  // SECCIONES
  // ============================================

  /**
   * @swagger
   * /api/landing-content/sections:
   *   get:
   *     summary: Obtener todas las secciones de la landing page (público)
   *     tags: [Landing Content]
   *     description: Retorna todas las secciones con sus slides y opciones. Endpoint público.
   *     responses:
   *       200:
   *         description: Secciones obtenidas exitosamente
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/landing-content/sections', (req, res) =>
    landingContentController.getAllSections(req, res)
  );

  /**
   * @swagger
   * /api/landing-content/sections/{sectionKey}:
   *   get:
   *     summary: Obtener una sección específica (público)
   *     tags: [Landing Content]
   *     parameters:
   *       - in: path
   *         name: sectionKey
   *         required: true
   *         schema:
   *           type: string
   *         description: Clave única de la sección
   *     responses:
   *       200:
   *         description: Sección obtenida exitosamente
   *       404:
   *         description: Sección no encontrada
   */
  router.get('/landing-content/sections/:sectionKey', (req, res) =>
    landingContentController.getSectionByKey(req, res)
  );

  /**
   * @swagger
   * /api/landing-content/sections/{sectionKey}:
   *   put:
   *     summary: Actualizar una sección (solo administradores)
   *     tags: [Landing Content]
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
   *               texto_primario:
   *                 type: string
   *               texto_secundario:
   *                 type: string
   *               color_primario:
   *                 type: string
   *                 pattern: '^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$'
   *               color_secundario:
   *                 type: string
   *                 pattern: '^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$'
   *               imagen_principal_url:
   *                 type: string
   *               imagen_fondo_url:
   *                 type: string
   *               boton_texto:
   *                 type: string
   *               boton_color:
   *                 type: string
   *                 pattern: '^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$'
   *               boton_enlace:
   *                 type: string
   *               activo:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Sección actualizada exitosamente
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Sección no encontrada
   */
  router.put('/landing-content/sections/:sectionKey', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.updateSection(req, res)
  );

  /**
   * @swagger
   * /api/landing-content/sections/{sectionKey}/toggle:
   *   patch:
   *     summary: Activar/desactivar una sección (solo administradores)
   *     tags: [Landing Content]
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
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Sección no encontrada
   */
  router.patch('/landing-content/sections/:sectionKey/toggle', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.toggleSection(req, res)
  );

  // ============================================
  // SLIDES
  // ============================================

  /**
   * @swagger
   * /api/landing-content/slides:
   *   post:
   *     summary: Crear un nuevo slide (solo administradores)
   *     tags: [Landing Content]
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
   *               - imagen_url
   *             properties:
   *               section_key:
   *                 type: string
   *               tipo:
   *                 type: string
   *                 enum: [hero_slide, product_slide, collage_image]
   *               imagen_url:
   *                 type: string
   *               titulo:
   *                 type: string
   *               descripcion:
   *                 type: string
   *               orden:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Slide creado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   */
  router.post('/landing-content/slides', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.createSlide(req, res)
  );

  /**
   * @swagger
   * /api/landing-content/slides/{id}:
   *   put:
   *     summary: Actualizar un slide (solo administradores)
   *     tags: [Landing Content]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               titulo:
   *                 type: string
   *               descripcion:
   *                 type: string
   *               imagen_url:
   *                 type: string
   *               orden:
   *                 type: integer
   *               activo:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Slide actualizado exitosamente
   *       404:
   *         description: Slide no encontrado
   */
  router.put('/landing-content/slides/:id', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.updateSlide(req, res)
  );

  /**
   * @swagger
   * /api/landing-content/slides/{id}:
   *   delete:
   *     summary: Eliminar un slide (solo administradores)
   *     tags: [Landing Content]
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
  router.delete('/landing-content/slides/:id', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.deleteSlide(req, res)
  );

  /**
   * @swagger
   * /api/landing-content/slides/reorder:
   *   put:
   *     summary: Reordenar slides de una sección (solo administradores)
   *     tags: [Landing Content]
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
  router.put('/landing-content/slides/reorder', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.reorderSlides(req, res)
  );

  // ============================================
  // OPTIONS
  // ============================================

  /**
   * @swagger
   * /api/landing-content/options:
   *   post:
   *     summary: Crear una nueva opción (solo administradores)
   *     tags: [Landing Content]
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
   *               texto:
   *                 type: string
   *               orden:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Opción creada exitosamente
   */
  router.post('/landing-content/options', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.createOption(req, res)
  );

  /**
   * @swagger
   * /api/landing-content/options/{id}:
   *   put:
   *     summary: Actualizar una opción (solo administradores)
   *     tags: [Landing Content]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               texto:
   *                 type: string
   *               orden:
   *                 type: integer
   *               activo:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Opción actualizada exitosamente
   */
  router.put('/landing-content/options/:id', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.updateOption(req, res)
  );

  /**
   * @swagger
   * /api/landing-content/options/{id}:
   *   delete:
   *     summary: Eliminar una opción (solo administradores)
   *     tags: [Landing Content]
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
  router.delete('/landing-content/options/:id', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.deleteOption(req, res)
  );

  /**
   * @swagger
   * /api/landing-content/options/reorder:
   *   put:
   *     summary: Reordenar opciones de una sección (solo administradores)
   *     tags: [Landing Content]
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
  router.put('/landing-content/options/reorder', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.reorderOptions(req, res)
  );

  // ============================================
  // UPLOAD
  // ============================================

  /**
   * @swagger
   * /api/landing-content/upload:
   *   post:
   *     summary: Subir imagen para landing (solo administradores)
   *     tags: [Landing Content]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               imagen:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Imagen subida exitosamente
   */
  router.post('/landing-content/upload', authenticateToken, requireAdmin, (req, res) =>
    landingContentController.uploadImage(req, res)
  );
};

export default landingContentRoutes;
