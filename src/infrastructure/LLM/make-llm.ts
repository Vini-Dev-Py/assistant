import { ChatGroq } from '@langchain/groq'
import { ChatOpenAI } from '@langchain/openai'

export type LLMMap = {
  openai: ChatOpenAI
  groq: ChatGroq
}

export type LLMProvider = keyof LLMMap

interface LLMStrategy<TModel> {
  create(apiKey: string): TModel
}

type StrategyRegistry = {
  [P in LLMProvider]: LLMStrategy<LLMMap[P]>
}

class OpenAIChatStrategy implements LLMStrategy<ChatOpenAI> {
  create(apiKey: string): ChatOpenAI {
    return new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o-mini',
      model: 'gpt-4o-mini',
      temperature: 0.2
    })
  }
}

class GroqChatStrategy implements LLMStrategy<ChatGroq> {
  create(apiKey: string): ChatGroq {
    return new ChatGroq({
      apiKey,
      model: 'openai/gpt-oss-120b',
      temperature: 0.2
    })
  }
}

export class ChatModel {
  private static readonly defaultStrategies: StrategyRegistry = {
    openai: new OpenAIChatStrategy(),
    groq: new GroqChatStrategy()
  }

  constructor(private readonly strategies: StrategyRegistry = ChatModel.defaultStrategies) {}

  static createDefault(): ChatModel {
    return new ChatModel(ChatModel.defaultStrategies)
  }

  makeLLM<P extends LLMProvider>(provider: P, apiKey: string): LLMMap[P] {
    const strategy = this.strategies[provider]

    if (!strategy) {
      throw new Error('Unsupported LLM provider')
    }

    return strategy.create(apiKey)
  }
}
