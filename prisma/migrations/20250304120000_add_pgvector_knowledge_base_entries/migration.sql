-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge base entries table
CREATE TABLE "KnowledgeBaseEntry" (
    "id" SERIAL PRIMARY KEY,
    "embedding" vector(1536) NOT NULL,
    "rawText" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "source" TEXT,
    "embeddingModel" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index to optimize similarity searches
CREATE INDEX "KnowledgeBaseEntry_embedding_idx"
ON "KnowledgeBaseEntry"
USING ivfflat ("embedding" vector_cosine_ops)
WITH (lists = 100);

-- Ensure updatedAt reflects the last update timestamp
CREATE OR REPLACE FUNCTION set_knowledge_base_entry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_knowledge_base_entry_updated_at
BEFORE UPDATE ON "KnowledgeBaseEntry"
FOR EACH ROW
EXECUTE FUNCTION set_knowledge_base_entry_updated_at();
