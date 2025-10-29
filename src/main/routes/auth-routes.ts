import { AuthenticateUserUseCase } from '@/application/use-cases/authenticate-user'
import { RegisterUserUseCase } from '@/application/use-cases/register-user'
import { PrismaUserRepository } from '@/infrastructure/repositories/prisma-user-repository'
import { BcryptPasswordHasher } from '@/infrastructure/security/bcrypt-password-hasher'
import { JwtTokenService } from '@/infrastructure/security/jwt-token-service'
import { createAuthMiddleware } from '@/main/middleware/auth-middleware'
import { AuthController } from '@/presentation/controllers/auth-controller'
import { FastifyInstance } from 'fastify'

export async function registerAuthRoutes(app: FastifyInstance) {
  const userRepository = new PrismaUserRepository()
  const passwordHasher = new BcryptPasswordHasher()
  const tokenService = new JwtTokenService(process.env.JWT_SECRET ?? 'change-me')

  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher)
  const authenticateUserUseCase = new AuthenticateUserUseCase(
    userRepository,
    passwordHasher,
    tokenService
  )

  const authController = new AuthController(
    registerUserUseCase,
    authenticateUserUseCase,
    tokenService
  )

  const authMiddleware = createAuthMiddleware(tokenService, userRepository)

  app.post('/auth/register', (request, reply) => authController.register(request, reply))
  app.post('/auth/login', (request, reply) => authController.login(request, reply))
  app.get('/auth/me', { preHandler: authMiddleware }, (request, reply) =>
    authController.profile(request, reply)
  )
  app.post('/auth/refresh', { preHandler: authMiddleware }, (request, reply) =>
    authController.refresh(request, reply)
  )
}
