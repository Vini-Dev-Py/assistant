import { CreateKnowledgeBaseEntryUseCase } from "@/application/use-cases/create-knowledge-base-entry";
import { PrismaKnowledgeBaseRepository } from "@/infrastructure/repositories/prisma-knowledge-base-repository";
import { PrismaUserRepository } from "@/infrastructure/repositories/prisma-user-repository";
import { JwtTokenService } from "@/infrastructure/security/jwt-token-service";
import { createAuthMiddleware } from "@/main/middleware/auth-middleware";
import { KnowledgeBaseController } from "@/presentation/controllers/knowledge-base-controller";
import { FastifyInstance } from "fastify";

function resolveEmbeddingDimension(): number {
  const value = Number(process.env.EMBEDDING_DIMENSION ?? "1536");

  if (!Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
    return 1536;
  }

  return value;
}

export async function registerKnowledgeBaseRoutes(app: FastifyInstance) {
  const tokenService = new JwtTokenService(process.env.JWT_SECRET ?? "change-me");
  const userRepository = new PrismaUserRepository();
  const authMiddleware = createAuthMiddleware(tokenService, userRepository);

  const knowledgeBaseRepository = new PrismaKnowledgeBaseRepository();
  const createKnowledgeBaseEntryUseCase = new CreateKnowledgeBaseEntryUseCase(
    knowledgeBaseRepository,
    resolveEmbeddingDimension(),
  );

  const knowledgeBaseController = new KnowledgeBaseController(
    createKnowledgeBaseEntryUseCase,
  );

  app.post(
    "/knowledge-base/entries",
    { preHandler: authMiddleware },
    (request, reply) => knowledgeBaseController.create(request, reply),
  );
}
