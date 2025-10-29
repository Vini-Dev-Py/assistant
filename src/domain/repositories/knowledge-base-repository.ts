import { KnowledgeBaseEntry, NewKnowledgeBaseEntry } from "@/domain/entities/knowledge-base-entry";

export interface KnowledgeBaseRepository {
  create(data: NewKnowledgeBaseEntry): Promise<KnowledgeBaseEntry>;
}
