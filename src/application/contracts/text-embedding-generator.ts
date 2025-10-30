export interface TextEmbeddingGenerator {
  generateEmbedding(text: string): Promise<number[]>;
}
