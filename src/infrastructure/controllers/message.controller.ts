import { Request, Response } from 'express';
import { HandleMessageUseCase } from '../../application/use-cases/handle-message.use-case';

export class MessageController {
  constructor(private readonly handleMessageUseCase: HandleMessageUseCase) {}

  async handlePostMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;

      if (!message) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const result = await this.handleMessageUseCase.execute(message);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async handleGetMessages(req: Request, res: Response): Promise<void> {
    try {
      const messages = await this.handleMessageUseCase.getAllMessages();
      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}