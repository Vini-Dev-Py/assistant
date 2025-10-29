import { NextQuestionPlanner } from '@/application/use-cases/next-question-planner'
import { LangchainQuestionLanguageModel } from '@/infrastructure/LLM/langchain-question-language-model'
import { PrismaUserRepository } from '@/infrastructure/repositories/prisma-user-repository'
import { JwtTokenService } from '@/infrastructure/security/jwt-token-service'
import { createAuthMiddleware } from '@/main/middleware/auth-middleware'
import { QuestionController } from '@/presentation/controllers/question-controller'
import { FastifyInstance } from 'fastify'

export async function registerQuestionRoutes(app: FastifyInstance) {
  const tokenService = new JwtTokenService(process.env.JWT_SECRET ?? 'change-me')
  const userRepository = new PrismaUserRepository()
  const authMiddleware = createAuthMiddleware(tokenService, userRepository)

  const questionLanguageModel = new LangchainQuestionLanguageModel(
    'groq',
    process.env.GROQ_API_KEY ?? ''
  )
  const nextQuestionPlanner = new NextQuestionPlanner(questionLanguageModel)
  const questionController = new QuestionController(nextQuestionPlanner)

  app.post('/questions', { preHandler: authMiddleware }, (request, reply) =>
    questionController.handler(request, reply)
  )
}
