-- Add prompt column to knowledge base entries
ALTER TABLE "KnowledgeBaseEntry"
ADD COLUMN "prompt" TEXT;
