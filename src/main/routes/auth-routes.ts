import { AuthenticateUserUseCase } from "@/application/use-cases/authenticate-user";
import { RegisterUserUseCase } from "@/application/use-cases/register-user";
import { createAuthMiddleware } from "@/main/middleware/auth-middleware";
import { PrismaUserRepository } from "@/infrastructure/repositories/prisma-user-repository";
import { BcryptPasswordHasher } from "@/infrastructure/security/bcrypt-password-hasher";
import { JwtTokenService } from "@/infrastructure/security/jwt-token-service";
import { AuthController } from "@/presentation/controllers/auth-controller";
import { FastifyInstance } from "fastify";

export async function registerAuthRoutes(app: FastifyInstance) {
  const userRepository = new PrismaUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService(process.env.JWT_SECRET ?? "change-me");

  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
  const authenticateUserUseCase = new AuthenticateUserUseCase(
    userRepository,
    passwordHasher,
    tokenService,
  );

  const authController = new AuthController(
    registerUserUseCase,
    authenticateUserUseCase,
    tokenService,
  );

  const authMiddleware = createAuthMiddleware(tokenService, userRepository);

  app.post("/auth/register", authController.register);
  app.post("/auth/login", authController.login);
  app.get("/auth/me", { preHandler: authMiddleware }, authController.profile);
  app.post("/auth/refresh", { preHandler: authMiddleware }, authController.refresh);
}
