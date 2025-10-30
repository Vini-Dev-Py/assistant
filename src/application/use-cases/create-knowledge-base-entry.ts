import { TextEmbeddingGenerator } from "@/application/contracts/text-embedding-generator";
import { TextSummarizer } from "@/application/contracts/text-summarizer";
import { ApplicationError } from "@/application/errors/application-error";
import { InvalidEmbeddingVectorError } from "@/application/errors/invalid-embedding-vector-error";
import {
  KnowledgeBaseEntry,
  NewKnowledgeBaseEntry,
} from "@/domain/entities/knowledge-base-entry";
import { KnowledgeBaseRepository } from "@/domain/repositories/knowledge-base-repository";

interface CreateKnowledgeBaseEntryInput {
  rawText: string;
  source?: string | null;
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
    private readonly textSummarizer: TextSummarizer,
    private readonly embeddingGenerator: TextEmbeddingGenerator,
    private readonly embeddingDimension: number,
  ) {
    if (!Number.isInteger(embeddingDimension) || embeddingDimension <= 0) {
      throw new Error("Embedding dimension must be a positive integer");
    }
  }

  async execute(
    input: CreateKnowledgeBaseEntryInput,
  ): Promise<CreateKnowledgeBaseEntryOutput> {
    const trimmedText = input.rawText.trim();
    const sanitizedMetadata = input.metadata ?? null;

    const summaryResult = await this.textSummarizer.summarize(trimmedText);
    const embeddingVector = await this.embeddingGenerator.generateEmbedding(
      trimmedText,
    );

    const sanitizedEmbedding = embeddingVector.map((value) => Number(value));

    if (sanitizedEmbedding.length !== this.embeddingDimension) {
      throw new InvalidEmbeddingVectorError(
        this.embeddingDimension,
        sanitizedEmbedding.length,
      );
    }

    if (!sanitizedEmbedding.every(isFiniteNumber)) {
      throw new ApplicationError("Embedding vector must contain only finite numbers.");
    }

    const embeddingModelIdentifier = `${summaryResult.provider}:${summaryResult.model}`;

    const data: NewKnowledgeBaseEntry = {
      rawText: trimmedText,
      summary: summaryResult.summary,
      embedding: sanitizedEmbedding,
      source: input.source ?? null,
      embeddingModel: embeddingModelIdentifier,
      metadata: sanitizedMetadata,
    };

    const entry = await this.knowledgeBaseRepository.create(data);

    return { entry };
  }
}
