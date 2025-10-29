export interface KnowledgeBaseEntry {
  id: number;
  embedding: number[];
  rawText: string;
  summary: string;
  source: string | null;
  embeddingModel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewKnowledgeBaseEntry {
  embedding: number[];
  rawText: string;
  summary: string;
  source?: string | null;
  embeddingModel?: string | null;
  metadata?: Record<string, unknown> | null;
}
