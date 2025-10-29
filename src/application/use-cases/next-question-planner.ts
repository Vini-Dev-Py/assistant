import { QuestionLanguageModel } from '@/application/contracts/question-language-model'
import { INextQuestionPlanner } from '../contracts/next-question-planner'

export class NextQuestionPlanner implements INextQuestionPlanner {
  constructor(private readonly questionLanguageModel: QuestionLanguageModel) {}

  async execute(question: string, prompt: string): Promise<string> {
    return this.questionLanguageModel.generate(question, prompt)
  }
}
