import { SubmitQuestionUseCase } from "@/application/use-cases/submit-question";
import { LangchainQuestionLanguageModel } from "@/infrastructure/LLM/langchain-question-language-model";
import { PrismaChatRepository } from "@/infrastructure/repositories/prisma-chat-repository";
import { PrismaMessageRepository } from "@/infrastructure/repositories/prisma-message-repository";
import { PrismaUserRepository } from "@/infrastructure/repositories/prisma-user-repository";
import { JwtTokenService } from "@/infrastructure/security/jwt-token-service";
import { createAuthMiddleware } from "@/main/middleware/auth-middleware";
import { QuestionController } from "@/presentation/controllers/question-controller";
import { AuthenticatedRequest } from "@/presentation/interfaces/authenticated-request";
import { FastifyInstance } from "fastify";

export async function registerQuestionRoutes(app: FastifyInstance) {
  const tokenService = new JwtTokenService(process.env.JWT_SECRET ?? "change-me");
  const userRepository = new PrismaUserRepository();
  const chatRepository = new PrismaChatRepository();
  const messageRepository = new PrismaMessageRepository();
  const authMiddleware = createAuthMiddleware(tokenService, userRepository);

  const questionLanguageModel = new LangchainQuestionLanguageModel(
    "groq",
    process.env.GROQ_API_KEY ?? "",
  );

  const submitQuestionUseCase = new SubmitQuestionUseCase(
    chatRepository,
    messageRepository,
    questionLanguageModel,
  );
  const questionController = new QuestionController(submitQuestionUseCase);

  app.post("/questions", { preHandler: authMiddleware }, (request, reply) =>
    questionController.handler(request as AuthenticatedRequest, reply),
  );
}
