export interface QuestionLanguageModel {
  generate(question: string, prompt: string): Promise<string>
}
