export type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface QuestionLanguageModel {
  generate(question: string, prompt: string, context: ChatCompletionMessage[]): Promise<string>
}
