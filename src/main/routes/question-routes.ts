import { NextQuestionPlanner } from '@/application/use-cases/next-question-planner'
import { PrismaUserRepository } from '@/infrastructure/repositories/prisma-user-repository'
import { JwtTokenService } from '@/infrastructure/security/jwt-token-service'
import { createAuthMiddleware } from '@/main/middleware/auth-middleware'
import { QuestionController } from '@/presentation/controllers/question-controller'
import { FastifyInstance } from 'fastify'

export async function registerQuestionRoutes(app: FastifyInstance) {
  const tokenService = new JwtTokenService(process.env.JWT_SECRET ?? 'change-me')
  const userRepository = new PrismaUserRepository()
  const authMiddleware = createAuthMiddleware(tokenService, userRepository)

  const nextQuestionPlanner = new NextQuestionPlanner()
  const questionController = new QuestionController(nextQuestionPlanner)

  app.post('/questions', { preHandler: authMiddleware }, (request, reply) =>
    questionController.handler(request, reply)
  )
}
