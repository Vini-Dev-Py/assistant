import { CreateKnowledgeBaseEntryUseCase } from "@/application/use-cases/create-knowledge-base-entry";
import { ApplicationError } from "@/application/errors/application-error";
import { AuthenticatedRequest } from "@/presentation/interfaces/authenticated-request";
import { CreateKnowledgeBaseEntryBody } from "@/presentation/interfaces/knowledge-base";
import { FastifyReply } from "fastify";
import Joi from "joi";

const validationOptions = {
  abortEarly: false,
  stripUnknown: true,
};

const createEntrySchema = Joi.object<CreateKnowledgeBaseEntryBody>({
  rawText: Joi.string().trim().min(1).required(),
  summary: Joi.string().trim().min(1).required(),
  embedding: Joi.array().items(Joi.number().required()).min(1).required(),
  source: Joi.string().trim().allow("").optional(),
  embeddingModel: Joi.string().trim().allow("").optional(),
  metadata: Joi.object().optional(),
});

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
    const { value, error } = createEntrySchema.validate(
      request.body,
      validationOptions,
    );

    if (error) {
      return reply.status(400).send({
        message: "Invalid request body",
        details: error.details.map((detail) => detail.message),
      });
    }

    const body = value as CreateKnowledgeBaseEntryBody;
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
