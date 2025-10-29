export interface INextQuestionPlanner {
  execute(question: string, prompt: string): Promise<string>
}
