import { TextEmbeddingGenerator } from '@/application/contracts/text-embedding-generator'
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector'
import { OpenAIEmbeddings } from '@langchain/openai'

type PgVectorConfig = {
  connectionString: string
  tableName?: string
  embeddingModel?: string
  dimensions?: number
  openAIApiKey: string
}

const DEFAULT_TABLE = 'langchain_pg_embedding'
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small'

export class LangchainPgvectorEmbeddingGenerator implements TextEmbeddingGenerator {
  private readonly vectorStorePromise: Promise<PGVectorStore>
  private readonly embeddings: OpenAIEmbeddings

  constructor(config: PgVectorConfig) {
    if (!config.connectionString) {
      throw new Error('DATABASE_URL is required to initialize the PGVector embedding generator.')
    }

    if (!config.openAIApiKey) {
      throw new Error('An OpenAI API key is required to generate embeddings with Langchain.')
    }

    const tableName = config.tableName?.trim() || DEFAULT_TABLE
    const embeddingsOptions: {
      apiKey: string
      model: string
      dimensions?: number
    } = {
      apiKey: config.openAIApiKey,
      model: config.embeddingModel?.trim() || DEFAULT_EMBEDDING_MODEL
    }

    if (typeof config.dimensions === 'number') {
      embeddingsOptions.dimensions = config.dimensions
    }

    this.embeddings = new OpenAIEmbeddings(embeddingsOptions)

    this.vectorStorePromise = PGVectorStore.initialize(this.embeddings, {
      postgresConnectionOptions: {
        connectionString: config.connectionString
      },
      tableName
    })
  }

  async generateEmbedding(text: string): Promise<number[]> {
    await this.vectorStorePromise
    return this.embeddings.embedQuery(text)
  }
}
