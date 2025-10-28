import { EchoQuestionUseCase } from "@/application/use-cases/echo-question";
import { PrismaUserRepository } from "@/infrastructure/repositories/prisma-user-repository";
import { JwtTokenService } from "@/infrastructure/security/jwt-token-service";
import { createAuthMiddleware } from "@/main/middleware/auth-middleware";
import { QuestionController } from "@/presentation/controllers/question-controller";
import { FastifyInstance } from "fastify";

export async function registerQuestionRoutes(app: FastifyInstance) {
  const tokenService = new JwtTokenService(
    process.env.JWT_SECRET ?? "change-me"
  );
  const userRepository = new PrismaUserRepository();
  const authMiddleware = createAuthMiddleware(tokenService, userRepository);

  const echoQuestionUseCase = new EchoQuestionUseCase();
  const questionController = new QuestionController(echoQuestionUseCase);

  app.post(
    "/questions",
    { preHandler: authMiddleware },
    questionController.handler
  );
}
