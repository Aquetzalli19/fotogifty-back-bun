import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: General
 *   description: Endpoints generales de la API
 */
const generalRoutes = (router: Router): void => {
  /**
   * @swagger
   * /:
   *   get:
   *     summary: Endpoint principal de la API
   *     description: Retorna un mensaje de bienvenida
   *     tags: [General]
   *     responses:
   *       200:
   *         description: Mensaje de bienvenida
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Hello World from Bun + Express + TypeScript!"
   */
  router.get('/', (req, res) => {
    res.json({ message: 'Hello World from Bun + Express + TypeScript!' });
  });

  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check de la API
   *     description: Verifica que la API esté funcionando correctamente
   *     tags: [General]
   *     responses:
   *       200:
   *         description: API funcionando correctamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "OK"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                   example: "2024-01-01T12:00:00.000Z"
   */
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  });
};

export default generalRoutes;