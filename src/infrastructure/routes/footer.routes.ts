import { Router } from 'express';
import { FooterController } from '@infrastructure/controllers/footer.controller';
import { ObtenerFooterConfigUseCase } from '@application/use-cases/obtener-footer-config.use-case';
import { ActualizarFooterConfigUseCase } from '@application/use-cases/actualizar-footer-config.use-case';
import { CrearSocialLinkUseCase } from '@application/use-cases/crear-social-link.use-case';
import { ActualizarSocialLinkUseCase } from '@application/use-cases/actualizar-social-link.use-case';
import { EliminarSocialLinkUseCase } from '@application/use-cases/eliminar-social-link.use-case';
import { ReordenarSocialLinksUseCase } from '@application/use-cases/reordenar-social-links.use-case';
import { PrismaFooterConfigRepository } from '@infrastructure/repositories/prisma-footer-config.repository';
import { PrismaSocialLinkRepository } from '@infrastructure/repositories/prisma-social-link.repository';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Footer
 *   description: Gestión de la configuración del footer
 */

const footerRoutes = (router: Router): void => {
  // Repositories
  const footerConfigRepository = new PrismaFooterConfigRepository();
  const socialLinkRepository = new PrismaSocialLinkRepository();

  // Use Cases
  const obtenerFooterConfigUseCase = new ObtenerFooterConfigUseCase(footerConfigRepository);
  const actualizarFooterConfigUseCase = new ActualizarFooterConfigUseCase(footerConfigRepository);
  const crearSocialLinkUseCase = new CrearSocialLinkUseCase(socialLinkRepository, footerConfigRepository);
  const actualizarSocialLinkUseCase = new ActualizarSocialLinkUseCase(socialLinkRepository);
  const eliminarSocialLinkUseCase = new EliminarSocialLinkUseCase(socialLinkRepository);
  const reordenarSocialLinksUseCase = new ReordenarSocialLinksUseCase(socialLinkRepository);

  // Controller
  const footerController = new FooterController(
    obtenerFooterConfigUseCase,
    actualizarFooterConfigUseCase,
    crearSocialLinkUseCase,
    actualizarSocialLinkUseCase,
    eliminarSocialLinkUseCase,
    reordenarSocialLinksUseCase
  );

  // ============================================
  // CONFIGURACIÓN DEL FOOTER
  // ============================================

  /**
   * @swagger
   * /api/footer/config:
   *   get:
   *     summary: Obtener configuración del footer (público)
   *     tags: [Footer]
   *     description: Retorna la configuración del footer con enlaces sociales activos. Endpoint público sin autenticación.
   *     responses:
   *       200:
   *         description: Configuración obtenida exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                   example: 1
   *                 descripcion:
   *                   type: string
   *                   nullable: true
   *                   example: "Imprime tus recuerdos favoritos"
   *                 email:
   *                   type: string
   *                   nullable: true
   *                   example: "hola@fotogifty.com"
   *                 telefono:
   *                   type: string
   *                   nullable: true
   *                   example: "+52 55 1234 5678"
   *                 socialLinks:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       plataforma:
   *                         type: string
   *                         enum: [instagram, facebook, whatsapp, tiktok, twitter, youtube]
   *                       url:
   *                         type: string
   *                       orden:
   *                         type: integer
   *                       activo:
   *                         type: boolean
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/footer/config', (req, res) =>
    footerController.getFooterConfig(req, res)
  );

  /**
   * @swagger
   * /api/footer/config:
   *   put:
   *     summary: Actualizar configuración del footer (solo administradores)
   *     tags: [Footer]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               descripcion:
   *                 type: string
   *                 nullable: true
   *                 example: "Imprime tus recuerdos favoritos"
   *               email:
   *                 type: string
   *                 nullable: true
   *                 example: "hola@fotogifty.com"
   *               telefono:
   *                 type: string
   *                 nullable: true
   *                 example: "+52 55 1234 5678"
   *     responses:
   *       200:
   *         description: Configuración actualizada exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 descripcion:
   *                   type: string
   *                   nullable: true
   *                 email:
   *                   type: string
   *                   nullable: true
   *                 telefono:
   *                   type: string
   *                   nullable: true
   *                 socialLinks:
   *                   type: array
   *                   items:
   *                     type: object
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/footer/config', authenticateToken, requireAdmin, (req, res) =>
    footerController.updateFooterConfig(req, res)
  );

  // ============================================
  // ENLACES SOCIALES
  // ============================================

  /**
   * @swagger
   * /api/footer/social-links:
   *   post:
   *     summary: Crear enlace de red social (solo administradores)
   *     tags: [Footer]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - plataforma
   *               - url
   *             properties:
   *               plataforma:
   *                 type: string
   *                 enum: [instagram, facebook, whatsapp, tiktok, twitter, youtube]
   *                 example: "instagram"
   *               url:
   *                 type: string
   *                 format: uri
   *                 example: "https://instagram.com/fotogifty"
   *               orden:
   *                 type: integer
   *                 default: 0
   *                 example: 0
   *               activo:
   *                 type: boolean
   *                 default: true
   *                 example: true
   *     responses:
   *       201:
   *         description: Enlace creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 plataforma:
   *                   type: string
   *                 url:
   *                   type: string
   *                 orden:
   *                   type: integer
   *                 activo:
   *                   type: boolean
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       409:
   *         description: Ya existe un enlace para esa plataforma
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/footer/social-links', authenticateToken, requireAdmin, (req, res) =>
    footerController.createSocialLink(req, res)
  );

  /**
   * @swagger
   * /api/footer/social-links/reorder:
   *   put:
   *     summary: Reordenar enlaces sociales (solo administradores)
   *     tags: [Footer]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - ids
   *             properties:
   *               ids:
   *                 type: array
   *                 items:
   *                   type: integer
   *                 example: [3, 1, 2, 5, 4]
   *                 description: Array de IDs en el orden deseado. El índice en el array se convierte en el campo 'orden'.
   *     responses:
   *       200:
   *         description: Orden actualizado exitosamente
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
   *                   example: "Orden actualizado exitosamente"
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Uno o más enlaces no encontrados
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/footer/social-links/reorder', authenticateToken, requireAdmin, (req, res) =>
    footerController.reorderSocialLinks(req, res)
  );

  /**
   * @swagger
   * /api/footer/social-links/{id}:
   *   put:
   *     summary: Actualizar enlace de red social (solo administradores)
   *     tags: [Footer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del enlace social
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               plataforma:
   *                 type: string
   *                 enum: [instagram, facebook, whatsapp, tiktok, twitter, youtube]
   *               url:
   *                 type: string
   *                 format: uri
   *               orden:
   *                 type: integer
   *               activo:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Enlace actualizado exitosamente
   *       400:
   *         description: Datos inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Enlace no encontrado
   *       409:
   *         description: Ya existe un enlace para esa plataforma
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/footer/social-links/:id', authenticateToken, requireAdmin, (req, res) =>
    footerController.updateSocialLink(req, res)
  );

  /**
   * @swagger
   * /api/footer/social-links/{id}:
   *   delete:
   *     summary: Eliminar enlace de red social (solo administradores)
   *     tags: [Footer]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del enlace social
   *     responses:
   *       200:
   *         description: Enlace eliminado exitosamente
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
   *                   example: "Enlace eliminado exitosamente"
   *       400:
   *         description: ID inválido
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado
   *       404:
   *         description: Enlace no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.delete('/footer/social-links/:id', authenticateToken, requireAdmin, (req, res) =>
    footerController.deleteSocialLink(req, res)
  );
};

export default footerRoutes;
