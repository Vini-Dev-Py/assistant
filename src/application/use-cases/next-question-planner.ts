import { ChatModel } from '@/infrastructure/LLM/make-llm'
import { INextQuestionPlanner } from '../contracts/next-question-planner'

export class NextQuestionPlanner implements INextQuestionPlanner {
  constructor() {}

  async execute(question: string, prompt: string): Promise<string> {
    const LLM = new ChatModel()
    const llmInstance = LLM.makeLLM('groq', process.env.GROQ_API_KEY ?? '')

    const response = await llmInstance.client.chat.completions.create({
      model: llmInstance.model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: question }
      ]
    })

    const plannedQuestion = response?.choices?.[0]?.message?.content ?? ''
    return plannedQuestion
  }
}
