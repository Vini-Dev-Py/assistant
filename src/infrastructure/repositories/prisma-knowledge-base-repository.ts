import { TextDecoder } from "util";

import {
  KnowledgeBaseEntry,
  NewKnowledgeBaseEntry,
} from "@/domain/entities/knowledge-base-entry";
import { KnowledgeBaseRepository } from "@/domain/repositories/knowledge-base-repository";
import { prisma } from "@/infrastructure/database/prisma-client";

type KnowledgeBaseEntryRow = {
  id: number;
  embedding: unknown;
  rawText: string;
  summary: string;
  source: string | null;
  embeddingModel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

function parseEmbedding(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map((component) => Number(component));
  }

  if (typeof value === "string") {
    const cleaned = value.trim();

    if (!cleaned.startsWith("[") || !cleaned.endsWith("]")) {
      throw new Error("Unexpected vector format returned by the database");
    }

    const inner = cleaned.slice(1, -1).trim();

    if (inner.length === 0) {
      return [];
    }

    return inner
      .split(",")
      .map((component) => Number(component.trim()));
  }

  if (value instanceof Uint8Array) {
    const textDecoder = new TextDecoder();
    return parseEmbedding(textDecoder.decode(value));
  }

  throw new Error("Unsupported embedding format returned by the database");
}

function mapRowToEntity(row: KnowledgeBaseEntryRow): KnowledgeBaseEntry {
  return {
    id: row.id,
    embedding: parseEmbedding(row.embedding),
    rawText: row.rawText,
    summary: row.summary,
    source: row.source,
    embeddingModel: row.embeddingModel,
    metadata: row.metadata,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.map((value) => value.toString()).join(",")}]`;
}

export class PrismaKnowledgeBaseRepository implements KnowledgeBaseRepository {
  async create(data: NewKnowledgeBaseEntry): Promise<KnowledgeBaseEntry> {
    const embeddingLiteral = toVectorLiteral(data.embedding);

    const rows = await prisma.$queryRaw<KnowledgeBaseEntryRow[]>`
      INSERT INTO "KnowledgeBaseEntry" (
        "embedding",
        "rawText",
        "summary",
        "source",
        "embeddingModel",
        "metadata"
      )
      VALUES (
        ${embeddingLiteral}::vector,
        ${data.rawText},
        ${data.summary},
        ${data.source ?? null},
        ${data.embeddingModel ?? null},
        ${data.metadata ? JSON.stringify(data.metadata) : null}::jsonb
      )
      RETURNING
        "id",
        "embedding",
        "rawText",
        "summary",
        "source",
        "embeddingModel",
        "metadata",
        "createdAt",
        "updatedAt"
    `;

    const [row] = rows;

    if (!row) {
      throw new Error("Failed to create knowledge base entry");
    }

    return mapRowToEntity(row);
  }
}
