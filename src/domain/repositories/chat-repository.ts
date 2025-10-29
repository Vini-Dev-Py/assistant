import { Chat, NewChat } from "@/domain/entities/chat";

export interface ChatRepository {
  create(data: NewChat): Promise<Chat>;
  findById(id: number): Promise<Chat | null>;
}
