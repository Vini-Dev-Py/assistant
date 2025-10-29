import { Chat } from "@/domain/entities/chat";
import { ChatRepository } from "@/domain/repositories/chat-repository";

type CreateChatInput = {
  title: string;
  userId: number;
};

type CreateChatOutput = {
  chat: Chat;
};

export class CreateChatUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(input: CreateChatInput): Promise<CreateChatOutput> {
    const chat = await this.chatRepository.create({
      title: input.title,
      userId: input.userId,
    });

    return { chat };
  }
}
