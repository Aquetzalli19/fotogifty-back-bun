import { Router } from 'express';
import { DocumentoLegalController } from '@infrastructure/controllers/documento-legal.controller';
import { CrearDocumentoLegalUseCase } from '@application/use-cases/crear-documento-legal.use-case';
import { ObtenerDocumentoLegalActivoUseCase } from '@application/use-cases/obtener-documento-legal-activo.use-case';
import { ObtenerTodosDocumentosLegalesUseCase } from '@application/use-cases/obtener-todos-documentos-legales.use-case';
import { ActualizarDocumentoLegalUseCase } from '@application/use-cases/actualizar-documento-legal.use-case';
import { EliminarDocumentoLegalUseCase } from '@application/use-cases/eliminar-documento-legal.use-case';
import { ActivarDocumentoLegalUseCase } from '@application/use-cases/activar-documento-legal.use-case';
import { PrismaDocumentoLegalRepository } from '@infrastructure/repositories/prisma-documento-legal.repository';
import { authenticateToken, requireAdmin } from '@infrastructure/middlewares/auth.middleware';

/**
 * @swagger
 * tags:
 *   name: Documentos Legales
 *   description: Gestión de términos y condiciones y avisos de privacidad
 */

const documentoLegalRoutes = (router: Router): void => {
  const documentoLegalRepository = new PrismaDocumentoLegalRepository();
  const crearDocumentoLegalUseCase = new CrearDocumentoLegalUseCase(documentoLegalRepository);
  const obtenerDocumentoLegalActivoUseCase = new ObtenerDocumentoLegalActivoUseCase(documentoLegalRepository);
  const obtenerTodosDocumentosLegalesUseCase = new ObtenerTodosDocumentosLegalesUseCase(documentoLegalRepository);
  const actualizarDocumentoLegalUseCase = new ActualizarDocumentoLegalUseCase(documentoLegalRepository);
  const eliminarDocumentoLegalUseCase = new EliminarDocumentoLegalUseCase(documentoLegalRepository);
  const activarDocumentoLegalUseCase = new ActivarDocumentoLegalUseCase(documentoLegalRepository);

  const documentoLegalController = new DocumentoLegalController(
    crearDocumentoLegalUseCase,
    obtenerDocumentoLegalActivoUseCase,
    obtenerTodosDocumentosLegalesUseCase,
    actualizarDocumentoLegalUseCase,
    eliminarDocumentoLegalUseCase,
    activarDocumentoLegalUseCase
  );

  /**
   * @swagger
   * /api/legal-documents/active/{tipo}:
   *   get:
   *     summary: Obtener el documento legal activo por tipo
   *     tags: [Documentos Legales]
   *     parameters:
   *       - in: path
   *         name: tipo
   *         required: true
   *         schema:
   *           type: string
   *           enum: [terms, privacy]
   *         description: Tipo de documento (terms para términos y condiciones, privacy para aviso de privacidad)
   *     responses:
   *       200:
   *         description: Documento legal activo encontrado
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
   *                     tipo:
   *                       type: string
   *                     titulo:
   *                       type: string
   *                     contenido:
   *                       type: string
   *                     version:
   *                       type: string
   *                     activo:
   *                       type: boolean
   *                     fecha_creacion:
   *                       type: string
   *                       format: date-time
   *                     fecha_actualizacion:
   *                       type: string
   *                       format: date-time
   *       404:
   *         description: No se encontró un documento activo de este tipo
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/legal-documents/active/:tipo', (req, res) =>
    documentoLegalController.obtenerActivo(req, res)
  );

  /**
   * @swagger
   * /api/legal-documents:
   *   post:
   *     summary: Crear un nuevo documento legal (solo administradores)
   *     tags: [Documentos Legales]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - tipo
   *               - titulo
   *               - contenido
   *               - version
   *             properties:
   *               tipo:
   *                 type: string
   *                 enum: [terms, privacy]
   *                 description: Tipo de documento
   *                 example: "terms"
   *               titulo:
   *                 type: string
   *                 description: Título del documento
   *                 example: "Términos y Condiciones"
   *               contenido:
   *                 type: string
   *                 description: Contenido HTML del documento
   *                 example: "<h1>Términos y Condiciones</h1><p>...</p>"
   *               version:
   *                 type: string
   *                 description: Versión del documento
   *                 example: "1.0.0"
   *     responses:
   *       201:
   *         description: Documento legal creado exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado (requiere ser administrador)
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/legal-documents', authenticateToken, requireAdmin, (req, res) =>
    documentoLegalController.crear(req, res)
  );

  /**
   * @swagger
   * /api/legal-documents:
   *   get:
   *     summary: Obtener todos los documentos legales (solo administradores)
   *     tags: [Documentos Legales]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de todos los documentos legales
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
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado (requiere ser administrador)
   *       500:
   *         description: Error interno del servidor
   */
  router.get('/legal-documents', authenticateToken, requireAdmin, (req, res) =>
    documentoLegalController.obtenerTodos(req, res)
  );

  /**
   * @swagger
   * /api/legal-documents/{id}:
   *   put:
   *     summary: Actualizar un documento legal (solo administradores)
   *     tags: [Documentos Legales]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del documento legal
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               tipo:
   *                 type: string
   *                 enum: [terms, privacy]
   *               titulo:
   *                 type: string
   *               contenido:
   *                 type: string
   *               version:
   *                 type: string
   *     responses:
   *       200:
   *         description: Documento legal actualizado exitosamente
   *       400:
   *         description: Datos de entrada inválidos
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado (requiere ser administrador)
   *       404:
   *         description: Documento legal no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.put('/legal-documents/:id', authenticateToken, requireAdmin, (req, res) =>
    documentoLegalController.actualizar(req, res)
  );

  /**
   * @swagger
   * /api/legal-documents/{id}:
   *   delete:
   *     summary: Eliminar un documento legal (solo administradores)
   *     tags: [Documentos Legales]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del documento legal
   *     responses:
   *       200:
   *         description: Documento legal eliminado exitosamente
   *       400:
   *         description: ID de documento inválido
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado (requiere ser administrador)
   *       404:
   *         description: Documento legal no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.delete('/legal-documents/:id', authenticateToken, requireAdmin, (req, res) =>
    documentoLegalController.eliminar(req, res)
  );

  /**
   * @swagger
   * /api/legal-documents/{id}/activate:
   *   post:
   *     summary: Activar un documento legal (solo administradores)
   *     tags: [Documentos Legales]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID del documento legal
   *     responses:
   *       200:
   *         description: Documento legal activado exitosamente
   *       400:
   *         description: ID de documento inválido
   *       401:
   *         description: No autenticado
   *       403:
   *         description: No autorizado (requiere ser administrador)
   *       404:
   *         description: Documento legal no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  router.post('/legal-documents/:id/activate', authenticateToken, requireAdmin, (req, res) =>
    documentoLegalController.activar(req, res)
  );
};

export default documentoLegalRoutes;
