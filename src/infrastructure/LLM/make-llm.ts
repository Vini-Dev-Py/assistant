import { ChatGroq } from '@langchain/groq'
import { ChatOpenAI } from '@langchain/openai'

type LLMMap = {
  openai: ChatOpenAI
  groq: ChatGroq
}

export type LLMProvider = keyof LLMMap

export class ChatModel {
  makeLLM<P extends LLMProvider>(provider: P, apiKey: string): LLMMap[P] {
    switch (provider) {
      case 'openai':
        return new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: 'gpt-4o-mini',
          model: 'gpt-4o-mini',
          temperature: 0.2
        }) as LLMMap[P]
      case 'groq':
        return new ChatGroq({
          apiKey,
          model: 'llama-3.3-70b-versatile'
        }) as LLMMap[P]
      default:
        throw new Error('Unsupported LLM provider')
    }
  }
}
