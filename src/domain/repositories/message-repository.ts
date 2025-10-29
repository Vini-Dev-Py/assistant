import { Message, NewMessage } from "@/domain/entities/message";

export interface MessageRepository {
  create(data: NewMessage): Promise<Message>;
  findByChatId(chatId: number): Promise<Message[]>;
}
