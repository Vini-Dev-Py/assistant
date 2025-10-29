import { CreateKnowledgeBaseEntryUseCase } from "@/application/use-cases/create-knowledge-base-entry";
import { ApplicationError } from "@/application/errors/application-error";
import { AuthenticatedRequest } from "@/presentation/interfaces/authenticated-request";
import { CreateKnowledgeBaseEntryBody } from "@/presentation/interfaces/knowledge-base";
import { FastifyReply } from "fastify";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeEntry(entry: {
  id: number;
  rawText: string;
  summary: string;
  source: string | null;
  embeddingModel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  const { rawText, summary, source, embeddingModel, metadata } = entry;

  return {
    id: entry.id,
    rawText,
    summary,
    source,
    embeddingModel,
    metadata,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export class KnowledgeBaseController {
  constructor(
    private readonly createKnowledgeBaseEntryUseCase: CreateKnowledgeBaseEntryUseCase,
  ) {}

  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    const body = request.body as Partial<CreateKnowledgeBaseEntryBody> | undefined;

    if (!body || !isNonEmptyString(body.rawText) || !isNonEmptyString(body.summary)) {
      return reply.status(400).send({ message: "Invalid request body" });
    }

    if (!Array.isArray(body.embedding) || body.embedding.length === 0) {
      return reply.status(400).send({ message: "Embedding must be a non-empty array" });
    }

    if (
      !body.embedding.every(
        (value) => typeof value === "number" && Number.isFinite(value),
      )
    ) {
      return reply
        .status(400)
        .send({ message: "Embedding array must contain only finite numbers" });
    }

    if (!isOptionalString(body.source) || !isOptionalString(body.embeddingModel)) {
      return reply.status(400).send({ message: "Invalid request body" });
    }

    if (body.metadata !== undefined && !isPlainObject(body.metadata)) {
      return reply.status(400).send({ message: "Metadata must be an object" });
    }

    const metadata = body.metadata as Record<string, unknown> | undefined;

    try {
      const { entry } = await this.createKnowledgeBaseEntryUseCase.execute({
        rawText: body.rawText.trim(),
        summary: body.summary.trim(),
        embedding: body.embedding,
        source: typeof body.source === "string" ? body.source.trim() || null : null,
        embeddingModel:
          typeof body.embeddingModel === "string"
            ? body.embeddingModel.trim() || null
            : null,
        metadata: metadata ?? null,
      });

      return reply.status(201).send({ entry: sanitizeEntry(entry) });
    } catch (error: unknown) {
      if (error instanceof ApplicationError) {
        return reply.status(error.statusCode).send({ message: error.message });
      }

      request.log.error({ err: error }, "Unexpected error while creating knowledge base entry");
      return reply.status(500).send({ message: "Internal server error" });
    }
  }
}
