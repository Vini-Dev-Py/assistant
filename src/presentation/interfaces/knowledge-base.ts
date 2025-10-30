export interface CreateKnowledgeBaseEntryBody {
  rawText: string;
  source?: string;
  metadata?: Record<string, unknown>;
}
