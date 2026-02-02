import { Router } from 'express';
import { AceptacionTerminosController } from '../controllers/aceptacion-terminos.controller';
import { ObtenerEstadoTerminosUseCase } from '@application/use-cases/obtener-estado-terminos.use-case';
import { AceptarTerminosUseCase } from '@application/use-cases/aceptar-terminos.use-case';
import { PrismaAceptacionTerminosRepository } from '../repositories/prisma-aceptacion-terminos.repository';
import { PrismaDocumentoLegalRepository } from '../repositories/prisma-documento-legal.repository';
import { authenticateToken } from '../middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Aceptación de Términos
 *   description: Endpoints para gestionar la aceptación de términos y condiciones
 */
const aceptacionTerminosRoutes = (router: Router): void => {
  const aceptacionTerminosRepository = new PrismaAceptacionTerminosRepository();
  const documentoLegalRepository = new PrismaDocumentoLegalRepository();

  const obtenerEstadoTerminosUseCase = new ObtenerEstadoTerminosUseCase(
    aceptacionTerminosRepository,
    documentoLegalRepository
  );

  const aceptarTerminosUseCase = new AceptarTerminosUseCase(
    aceptacionTerminosRepository,
    documentoLegalRepository
  );

  const controller = new AceptacionTerminosController(
    obtenerEstadoTerminosUseCase,
    aceptarTerminosUseCase
  );

  /**
   * @swagger
   * /api/usuarios/{id}/terms-status:
   *   get:
   *     summary: Obtener estado de aceptación de términos
   *     tags: [Aceptación de Términos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del usuario
   *     responses:
   *       200:
   *         description: Estado de términos obtenido exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       tipo:
   *                         type: string
   *                         enum: [terms, privacy]
   *                         example: terms
   *                       aceptado:
   *                         type: boolean
   *                         example: true
   *                       version_actual:
   *                         type: string
   *                         example: "1.0.0"
   *                       version_aceptada:
   *                         type: string
   *                         example: "1.0.0"
   *                       fecha_aceptacion:
   *                         type: string
   *                         format: date-time
   *                       requiere_aceptacion:
   *                         type: boolean
   *                         example: false
   *       400:
   *         description: ID de usuario inválido
   *       401:
   *         description: No autenticado
   *       500:
   *         description: Error interno del servidor
   */
  router.get(
    '/usuarios/:id/terms-status',
    authenticateToken,
    (req, res) => controller.getTermsStatus(req, res)
  );

  /**
   * @swagger
   * /api/usuarios/{id}/accept-terms:
   *   post:
   *     summary: Aceptar términos y condiciones
   *     tags: [Aceptación de Términos]
   *     security:
   *       - bearerAuth: []
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
   *               - tipo_documento
   *             properties:
   *               tipo_documento:
   *                 type: string
   *                 enum: [terms, privacy]
   *                 description: Tipo de documento a aceptar
   *                 example: terms
   *     responses:
   *       201:
   *         description: Términos aceptados exitosamente
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
   *                   example: "Términos aceptados exitosamente"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     version:
   *                       type: string
   *                       example: "1.0.0"
   *                     fecha_aceptacion:
   *                       type: string
   *                       format: date-time
   *       400:
   *         description: Datos inválidos o ya aceptado
   *       401:
   *         description: No autenticado
   *       500:
   *         description: Error interno del servidor
   */
  router.post(
    '/usuarios/:id/accept-terms',
    authenticateToken,
    (req, res) => controller.acceptTerms(req, res)
  );
};

export default aceptacionTerminosRoutes;
