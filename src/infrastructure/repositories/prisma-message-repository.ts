import { Message, NewMessage } from "@/domain/entities/message";
import { MessageRepository } from "@/domain/repositories/message-repository";
import { prisma } from "@/infrastructure/database/prisma-client";

export class PrismaMessageRepository implements MessageRepository {
  async create(data: NewMessage): Promise<Message> {
    return prisma.message.create({ data });
  }

  async findByChatId(chatId: number): Promise<Message[]> {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });
  }
}
