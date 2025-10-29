import { Chat, NewChat } from "@/domain/entities/chat";
import { ChatRepository } from "@/domain/repositories/chat-repository";
import { prisma } from "@/infrastructure/database/prisma-client";

export class PrismaChatRepository implements ChatRepository {
  async create(data: NewChat): Promise<Chat> {
    return prisma.chat.create({ data });
  }

  async findById(id: number): Promise<Chat | null> {
    return prisma.chat.findUnique({ where: { id } });
  }
}
