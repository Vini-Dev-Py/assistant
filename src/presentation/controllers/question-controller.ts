import { EchoQuestionUseCase } from "@/application/use-cases/echo-question";
import { QuestionBody } from "@/presentation/interfaces/question";
import { FastifyReply, FastifyRequest } from "fastify";

function isValidQuestion(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export class QuestionController {
  constructor(private readonly echoQuestionUseCase: EchoQuestionUseCase) {}

  async handler(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as Partial<QuestionBody> | undefined;

    if (!body || !isValidQuestion(body.question)) {
      return reply.status(400).send({ message: "Invalid request body" });
    }

    const response = await this.echoQuestionUseCase.execute({
      question: body.question,
    });

    return reply.status(200).send(response);
  }
}
