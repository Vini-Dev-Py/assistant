import { INextQuestionPlanner } from '@/application/contracts/next-question-planner'
import { QuestionBody } from '@/presentation/interfaces/question'
import { FastifyReply, FastifyRequest } from 'fastify'

function isValidQuestion(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export class QuestionController {
  constructor(private readonly nextQuestionPlanner: INextQuestionPlanner) {}

  async handler(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as Partial<QuestionBody> | undefined

    if (!body || !isValidQuestion(body.question)) {
      return reply.status(400).send({ message: 'Invalid request body' })
    }

    const plannedQuestion = await this.nextQuestionPlanner.execute(body.question, '')
    return reply.status(200).send({ question: plannedQuestion })
  }
}
