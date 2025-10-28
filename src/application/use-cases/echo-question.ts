export interface EchoQuestionRequest {
  question: string;
}

export class EchoQuestionUseCase {
  async execute({ question }: EchoQuestionRequest): Promise<string> {
    return question;
  }
}
