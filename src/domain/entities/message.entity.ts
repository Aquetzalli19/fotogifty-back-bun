export interface Message {
  id?: string;
  content: string;
  timestamp: Date;
}

export class MessageEntity implements Message {
  public id?: string;
  public content: string;
  public timestamp: Date;

  constructor(content: string, id?: string) {
    this.id = id;
    this.content = content;
    this.timestamp = new Date();
  }

  static create(content: string): MessageEntity {
    return new MessageEntity(content);
  }
}