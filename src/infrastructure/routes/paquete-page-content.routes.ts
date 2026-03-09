import { Router } from 'express';
import multer from 'multer';
import { PaquetePageContentController } from '@infrastructure/controllers/paquete-page-content.controller';
import { PrismaPaquetePageSectionRepository } from '@infrastructure/repositories/prisma-paquete-page-section.repository';
import { PrismaPaquetePageSlideRepository } from '@infrastructure/repositories/prisma-paquete-page-slide.repository';
import { PrismaPaquetePageOptionRepository } from '@infrastructure/repositories/prisma-paquete-page-option.repository';
import { PrismaProductPageSectionRepository } from '@infrastructure/repositories/prisma-product-page-section.repository';
import { PrismaProductPageSlideRepository } from '@infrastructure/repositories/prisma-product-page-slide.repository';
import { PrismaProductPageOptionRepository } from '@infrastructure/repositories/prisma-product-page-option.repository';
import { S3Service } from '@infrastructure/services/s3.service';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';
import { ObtenerContenidoMergedPaquetePageUseCase } from '@application/use-cases/obtener-contenido-merged-paquete-page.use-case';
import { ObtenerStatusOverridesPaquetePageUseCase } from '@application/use-cases/obtener-status-overrides-paquete-page.use-case';
import { ObtenerSeccionesPaquetePageUseCase } from '@application/use-cases/obtener-secciones-paquete-page.use-case';
import { UpsertSeccionPaquetePageUseCase } from '@application/use-cases/upsert-seccion-paquete-page.use-case';
import { EliminarSeccionPaquetePageUseCase } from '@application/use-cases/eliminar-seccion-paquete-page.use-case';
import { ToggleSeccionPaquetePageUseCase } from '@application/use-cases/toggle-seccion-paquete-page.use-case';
import { CrearSlidePaquetePageUseCase } from '@application/use-cases/crear-slide-paquete-page.use-case';
import { ActualizarSlidePaquetePageUseCase } from '@application/use-cases/actualizar-slide-paquete-page.use-case';
import { EliminarSlidePaquetePageUseCase } from '@application/use-cases/eliminar-slide-paquete-page.use-case';
import { ReordenarSlidesPaquetePageUseCase } from '@application/use-cases/reordenar-slides-paquete-page.use-case';
import { CrearOptionPaquetePageUseCase } from '@application/use-cases/crear-option-paquete-page.use-case';
import { ActualizarOptionPaquetePageUseCase } from '@application/use-cases/actualizar-option-paquete-page.use-case';
import { EliminarOptionPaquetePageUseCase } from '@application/use-cases/eliminar-option-paquete-page.use-case';
import { ReordenarOptionsPaquetePageUseCase } from '@application/use-cases/reordenar-options-paquete-page.use-case';
import { ClonarDesdeGlobalPaquetePageUseCase } from '@application/use-cases/clonar-desde-global-paquete-page.use-case';
import { SubirImagenPaquetePageUseCase } from '@application/use-cases/subir-imagen-paquete-page.use-case';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Solo se permiten imágenes'), false);
  }
});

/**
 * @swagger
 * tags:
 *   name: Paquete Page Content
 *   description: CMS de página de producto por paquete (overrides con fallback a global)
 */

const paquetePageContentRoutes = (router: Router): void => {
  const paqueteSectionRepo = new PrismaPaquetePageSectionRepository();
  const paqueteSlideRepo = new PrismaPaquetePageSlideRepository();
  const paqueteOptionRepo = new PrismaPaquetePageOptionRepository();
  const globalSectionRepo = new PrismaProductPageSectionRepository();
  const globalSlideRepo = new PrismaProductPageSlideRepository();
  const globalOptionRepo = new PrismaProductPageOptionRepository();
  const s3Service = new S3Service();

  const controller = new PaquetePageContentController(
    new ObtenerContenidoMergedPaquetePageUseCase(paqueteSectionRepo, paqueteSlideRepo, paqueteOptionRepo, globalSectionRepo, globalSlideRepo, globalOptionRepo),
    new ObtenerStatusOverridesPaquetePageUseCase(paqueteSectionRepo),
    new ObtenerSeccionesPaquetePageUseCase(paqueteSectionRepo, paqueteSlideRepo, paqueteOptionRepo),
    new UpsertSeccionPaquetePageUseCase(paqueteSectionRepo, paqueteSlideRepo, paqueteOptionRepo),
    new EliminarSeccionPaquetePageUseCase(paqueteSectionRepo),
    new ToggleSeccionPaquetePageUseCase(paqueteSectionRepo),
    new CrearSlidePaquetePageUseCase(paqueteSlideRepo, paqueteSectionRepo),
    new ActualizarSlidePaquetePageUseCase(paqueteSlideRepo),
    new EliminarSlidePaquetePageUseCase(paqueteSlideRepo),
    new ReordenarSlidesPaquetePageUseCase(paqueteSlideRepo, paqueteSectionRepo),
    new CrearOptionPaquetePageUseCase(paqueteOptionRepo, paqueteSectionRepo, paqueteSlideRepo),
    new ActualizarOptionPaquetePageUseCase(paqueteOptionRepo),
    new EliminarOptionPaquetePageUseCase(paqueteOptionRepo),
    new ReordenarOptionsPaquetePageUseCase(paqueteOptionRepo, paqueteSectionRepo),
    new ClonarDesdeGlobalPaquetePageUseCase(paqueteSectionRepo, paqueteSlideRepo, paqueteOptionRepo, globalSectionRepo, globalSlideRepo, globalOptionRepo),
    new SubirImagenPaquetePageUseCase(s3Service)
  );

  const base = '/paquetes/:paqueteId/page-content';

  /**
   * @swagger
   * /api/paquetes/{paqueteId}/page-content/merged:
   *   get:
   *     summary: Obtener contenido merged (per-producto con fallback a global) — público
   *     tags: [Paquete Page Content]
   *     parameters:
   *       - in: path
   *         name: paqueteId
   *         required: true
   *         schema: { type: integer }
   *     responses:
   *       200:
   *         description: Contenido merged retornado exitosamente
   *       404:
   *         description: Paquete no encontrado
   */
  router.get(`${base}/merged`, (req, res) => controller.getMergedContent(req, res));

  /**
   * @swagger
   * /api/paquetes/{paqueteId}/page-content/status:
   *   get:
   *     summary: Estado de overrides por sección (admin)
   *     tags: [Paquete Page Content]
   *     security:
   *       - bearerAuth: []
   */
  router.get(`${base}/status`, authenticateToken, requireAdmin, (req, res) => controller.getOverrideStatus(req, res));

  /**
   * @swagger
   * /api/paquetes/{paqueteId}/page-content/sections:
   *   get:
   *     summary: Secciones con override activo para este paquete (admin)
   *     tags: [Paquete Page Content]
   *     security:
   *       - bearerAuth: []
   */
  router.get(`${base}/sections`, authenticateToken, requireAdmin, (req, res) => controller.getSections(req, res));

  /**
   * @swagger
   * /api/paquetes/{paqueteId}/page-content/sections/{sectionKey}:
   *   put:
   *     summary: Crear o actualizar override de sección (admin) — upsert
   *     tags: [Paquete Page Content]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: paqueteId
   *         required: true
   *         schema: { type: integer }
   *       - in: path
   *         name: sectionKey
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               titulo: { type: string }
   *               subtitulo: { type: string }
   *               descripcion: { type: string }
   *               imagen_principal_url: { type: string }
   *               activo: { type: boolean }
   *     responses:
   *       200:
   *         description: Override creado/actualizado
   *       404:
   *         description: Paquete no encontrado
   */
  router.put(`${base}/sections/:sectionKey`, authenticateToken, requireAdmin, (req, res) => controller.upsertSection(req, res));

  /**
   * @swagger
   * /api/paquetes/{paqueteId}/page-content/sections/{sectionKey}:
   *   delete:
   *     summary: Eliminar override → revierte a global (admin)
   *     tags: [Paquete Page Content]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Sección revertida a global
   *       404:
   *         description: Override no encontrado
   */
  router.delete(`${base}/sections/:sectionKey`, authenticateToken, requireAdmin, (req, res) => controller.deleteSection(req, res));

  /**
   * @swagger
   * /api/paquetes/{paqueteId}/page-content/sections/{sectionKey}/toggle:
   *   patch:
   *     summary: Toggle activo del override (admin)
   *     tags: [Paquete Page Content]
   *     security:
   *       - bearerAuth: []
   */
  router.patch(`${base}/sections/:sectionKey/toggle`, authenticateToken, requireAdmin, (req, res) => controller.toggleSection(req, res));

  // ── SLIDES ────────────────────────────────────────────────────

  router.post(`${base}/slides`, authenticateToken, requireAdmin, (req, res) => controller.createSlide(req, res));

  // /reorder must come before /:slideId
  router.put(`${base}/slides/reorder`, authenticateToken, requireAdmin, (req, res) => controller.reorderSlides(req, res));
  router.put(`${base}/slides/:slideId`, authenticateToken, requireAdmin, (req, res) => controller.updateSlide(req, res));
  router.delete(`${base}/slides/:slideId`, authenticateToken, requireAdmin, (req, res) => controller.deleteSlide(req, res));

  // ── OPTIONS ───────────────────────────────────────────────────

  router.post(`${base}/options`, authenticateToken, requireAdmin, (req, res) => controller.createOption(req, res));

  // /reorder must come before /:optionId
  router.put(`${base}/options/reorder`, authenticateToken, requireAdmin, (req, res) => controller.reorderOptions(req, res));
  router.put(`${base}/options/:optionId`, authenticateToken, requireAdmin, (req, res) => controller.updateOption(req, res));
  router.delete(`${base}/options/:optionId`, authenticateToken, requireAdmin, (req, res) => controller.deleteOption(req, res));

  // ── CLONE + UPLOAD ────────────────────────────────────────────

  /**
   * @swagger
   * /api/paquetes/{paqueteId}/page-content/clone-from-global:
   *   post:
   *     summary: Clonar secciones globales como overrides (admin)
   *     tags: [Paquete Page Content]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               section_keys:
   *                 type: array
   *                 items: { type: string }
   *                 description: "Omitir para clonar todas las 6 secciones"
   *     responses:
   *       200:
   *         description: Secciones clonadas exitosamente
   */
  router.post(`${base}/clone-from-global`, authenticateToken, requireAdmin, (req, res) => controller.cloneFromGlobal(req, res));

  /**
   * @swagger
   * /api/paquetes/{paqueteId}/page-content/upload:
   *   post:
   *     summary: Subir imagen para override de paquete (admin)
   *     tags: [Paquete Page Content]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [section_key, image_type, imagen]
   *             properties:
   *               section_key: { type: string }
   *               image_type: { type: string, enum: [main, slide] }
   *               imagen: { type: string, format: binary }
   *     responses:
   *       200:
   *         description: Imagen subida exitosamente
   */
  router.post(`${base}/upload`, authenticateToken, requireAdmin, upload.single('imagen'), (req, res) => controller.uploadImage(req, res));
};

export default paquetePageContentRoutes;
