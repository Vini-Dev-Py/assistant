import { CreateKnowledgeBaseEntryUseCase } from "@/application/use-cases/create-knowledge-base-entry";
import { LangchainTextSummarizer } from "@/infrastructure/LLM/langchain-text-summarizer";
import { LLMProvider } from "@/infrastructure/LLM/make-llm";
import { PrismaKnowledgeBaseRepository } from "@/infrastructure/repositories/prisma-knowledge-base-repository";
import { PrismaUserRepository } from "@/infrastructure/repositories/prisma-user-repository";
import { JwtTokenService } from "@/infrastructure/security/jwt-token-service";
import { LangchainPgvectorEmbeddingGenerator } from "@/infrastructure/vector-stores/langchain-pgvector-embedding-generator";
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

function resolveProvider(): LLMProvider {
  const provider = (process.env.KNOWLEDGE_BASE_LLM_PROVIDER ?? "openai").toLowerCase();

  if (provider === "groq") {
    return "groq";
  }

  return "openai";
}

function resolveSummarizerApiKey(provider: LLMProvider): string {
  const explicitKey = process.env.KNOWLEDGE_BASE_LLM_API_KEY?.trim();

  if (explicitKey) {
    return explicitKey;
  }

  if (provider === "groq") {
    return (process.env.GROQ_API_KEY ?? "").trim();
  }

  return (process.env.OPENAI_API_KEY ?? "").trim();
}

function resolveEmbeddingApiKey(): string {
  return (
    process.env.KNOWLEDGE_BASE_EMBEDDINGS_API_KEY?.trim() ??
    process.env.OPENAI_API_KEY?.trim() ??
    ""
  );
}

export async function registerKnowledgeBaseRoutes(app: FastifyInstance) {
  const tokenService = new JwtTokenService(process.env.JWT_SECRET ?? "change-me");
  const userRepository = new PrismaUserRepository();
  const authMiddleware = createAuthMiddleware(tokenService, userRepository);

  const provider = resolveProvider();
  const embeddingDimension = resolveEmbeddingDimension();
  const summarizer = new LangchainTextSummarizer(
    provider,
    resolveSummarizerApiKey(provider),
    process.env.KNOWLEDGE_BASE_SUMMARY_PROMPT,
  );
  const tableName = process.env.KNOWLEDGE_BASE_PGVECTOR_TABLE?.trim();
  const embeddingModelName = process.env.KNOWLEDGE_BASE_EMBEDDING_MODEL?.trim();
  const embeddingGenerator = new LangchainPgvectorEmbeddingGenerator({
    connectionString: (process.env.DATABASE_URL ?? "").trim(),
    ...(tableName ? { tableName } : {}),
    ...(embeddingModelName ? { embeddingModel: embeddingModelName } : {}),
    dimensions: embeddingDimension,
    openAIApiKey: resolveEmbeddingApiKey(),
  });
  const knowledgeBaseRepository = new PrismaKnowledgeBaseRepository();
  const createKnowledgeBaseEntryUseCase = new CreateKnowledgeBaseEntryUseCase(
    knowledgeBaseRepository,
    summarizer,
    embeddingGenerator,
    embeddingDimension,
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
