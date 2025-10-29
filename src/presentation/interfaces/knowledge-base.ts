export interface CreateKnowledgeBaseEntryBody {
  rawText: string;
  summary: string;
  embedding: number[];
  source?: string;
  embeddingModel?: string;
  metadata?: Record<string, unknown>;
}
