import { CreateChatUseCase } from "@/application/use-cases/create-chat";
import { PrismaChatRepository } from "@/infrastructure/repositories/prisma-chat-repository";
import { PrismaUserRepository } from "@/infrastructure/repositories/prisma-user-repository";
import { JwtTokenService } from "@/infrastructure/security/jwt-token-service";
import { createAuthMiddleware } from "@/main/middleware/auth-middleware";
import { ChatController } from "@/presentation/controllers/chat-controller";
import { AuthenticatedRequest } from "@/presentation/interfaces/authenticated-request";
import { FastifyInstance } from "fastify";

export async function registerChatRoutes(app: FastifyInstance) {
  const tokenService = new JwtTokenService(process.env.JWT_SECRET ?? "change-me");
  const userRepository = new PrismaUserRepository();
  const chatRepository = new PrismaChatRepository();

  const authMiddleware = createAuthMiddleware(tokenService, userRepository);
  const createChatUseCase = new CreateChatUseCase(chatRepository);
  const chatController = new ChatController(createChatUseCase);

  app.post("/chats", { preHandler: authMiddleware }, (request, reply) =>
    chatController.create(request as AuthenticatedRequest, reply),
  );
}
