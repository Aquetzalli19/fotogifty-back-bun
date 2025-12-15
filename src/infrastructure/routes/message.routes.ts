import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { HandleMessageUseCase } from '@application/use-cases/handle-message.use-case';
import { InMemoryMessageRepository } from '../repositories/in-memory-message.repository';

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Gestión de mensajes
 */
const messageRoutes = (router: Router): void => {
  const messageRepository = new InMemoryMessageRepository();
  const handleMessageUseCase = new HandleMessageUseCase(messageRepository);
  const messageController = new MessageController(handleMessageUseCase);

  /**
   * @swagger
   * /api/messages:
   *   post:
   *     summary: Crear un nuevo mensaje
   *     tags: [Messages]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - message
   *             properties:
   *               message:
   *                 type: string
   *                 description: Contenido del mensaje
   *                 example: "Hola Mundo desde Bun!"
   *     responses:
   *       201:
   *         description: Mensaje creado exitosamente
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/Message'
   *       400:
   *         description: Bad Request - Mensaje requerido
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Internal Server Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/messages', (req, res) => 
    messageController.handlePostMessage(req, res)
  );

  /**
   * @swagger
   * /api/messages:
   *   get:
   *     summary: Obtener todos los mensajes
   *     tags: [Messages]
   *     responses:
   *       200:
   *         description: Lista de mensajes obtenida exitosamente
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
   *                     $ref: '#/components/schemas/Message'
   *       500:
   *         description: Internal Server Error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/messages', (req, res) => 
    messageController.handleGetMessages(req, res)
  );
};

export default messageRoutes;