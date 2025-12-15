import { Message } from '@domain/entities/message.entity';
import { MessageRepositoryPort } from '@domain/ports/message.repository.port';

export class HandleMessageUseCase {
  constructor(private readonly messageRepository: MessageRepositoryPort) {}

  async execute(content: string): Promise<Message> {
    const message: Message = {
      content,
      timestamp: new Date()
    };

    return await this.messageRepository.save(message);
  }

  async getAllMessages(): Promise<Message[]> {
    return await this.messageRepository.findAll();
  }
}