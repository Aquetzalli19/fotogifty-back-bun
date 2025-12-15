import { Message } from '@domain/entities/message.entity';
import { MessageRepositoryPort } from '@domain/ports/message.repository.port';

export class InMemoryMessageRepository implements MessageRepositoryPort {
  private messages: Message[] = [];

  async save(message: Message): Promise<Message> {
    const newMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.messages.push(newMessage);
    return newMessage;
  }

  async findAll(): Promise<Message[]> {
    return this.messages;

  }
}