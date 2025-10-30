import { ApplicationError } from "@/application/errors/application-error";
import { InvalidEmbeddingVectorError } from "@/application/errors/invalid-embedding-vector-error";
import {
  KnowledgeBaseEntry,
  NewKnowledgeBaseEntry,
} from "@/domain/entities/knowledge-base-entry";
import { KnowledgeBaseRepository } from "@/domain/repositories/knowledge-base-repository";

interface CreateKnowledgeBaseEntryInput {
  rawText: string;
  summary: string;
  embedding: number[];
  source?: string | null;
  embeddingModel?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface CreateKnowledgeBaseEntryOutput {
  entry: KnowledgeBaseEntry;
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

export class CreateKnowledgeBaseEntryUseCase {
  constructor(
    private readonly knowledgeBaseRepository: KnowledgeBaseRepository,
    private readonly embeddingDimension: number,
  ) {
    if (!Number.isInteger(embeddingDimension) || embeddingDimension <= 0) {
      throw new Error("Embedding dimension must be a positive integer");
    }
  }

  async execute(
    input: CreateKnowledgeBaseEntryInput,
  ): Promise<CreateKnowledgeBaseEntryOutput> {
    const sanitizedEmbedding = input.embedding.map((value) => Number(value));

    if (sanitizedEmbedding.length !== this.embeddingDimension) {
      throw new InvalidEmbeddingVectorError(
        this.embeddingDimension,
        sanitizedEmbedding.length,
      );
    }

    if (!sanitizedEmbedding.every(isFiniteNumber)) {
      throw new ApplicationError("Embedding vector must contain only finite numbers.");
    }

    const data: NewKnowledgeBaseEntry = {
      rawText: input.rawText,
      summary: input.summary,
      embedding: sanitizedEmbedding,
      source: input.source ?? null,
      embeddingModel: input.embeddingModel ?? null,
      metadata: input.metadata ?? null,
    };

    const entry = await this.knowledgeBaseRepository.create(data);

    return { entry };
  }
}
