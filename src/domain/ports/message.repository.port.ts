import { Message } from '../entities/message.entity';

export interface MessageRepositoryPort {
  save(message: Message): Promise<Message>;
  findAll(): Promise<Message[]>;
}