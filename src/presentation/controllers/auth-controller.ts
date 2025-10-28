import { TokenService } from "@/application/contracts/token-service";
import { ApplicationError } from "@/application/errors/application-error";
import { AuthenticateUserUseCase } from "@/application/use-cases/authenticate-user";
import { RegisterUserUseCase } from "@/application/use-cases/register-user";
import { User } from "@/domain/entities/user";
import {
  AuthenticateUserBody,
  RegisterUserBody,
} from "@/presentation/interfaces/auth";
import { AuthenticatedRequest } from "@/presentation/interfaces/authenticated-request";
import { FastifyReply, FastifyRequest } from "fastify";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function sanitizeUser(user: User): Omit<User, "password"> {
  const { password: _password, ...rest } = user;
  return rest;
}

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly tokenService: TokenService
  ) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as Partial<RegisterUserBody> | undefined;

    if (
      !body ||
      !isNonEmptyString(body.name) ||
      !isNonEmptyString(body.email) ||
      !isNonEmptyString(body.password)
    ) {
      return reply.status(400).send({ message: "Invalid request body" });
    }

    try {
      const { user } = await this.registerUserUseCase.execute({
        name: body.name.trim(),
        email: body.email.toLowerCase(),
        password: body.password,
      });

      return reply.status(201).send({ user: sanitizeUser(user) });
    } catch (error: unknown) {
      if (error instanceof ApplicationError) {
        return reply.status(error.statusCode).send({ message: error.message });
      }

      request.log.error(
        { err: error },
        "Unexpected error while registering user"
      );
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as Partial<AuthenticateUserBody> | undefined;

    if (
      !body ||
      !isNonEmptyString(body.email) ||
      !isNonEmptyString(body.password)
    ) {
      return reply.status(400).send({ message: "Invalid request body" });
    }

    try {
      const { token, user } = await this.authenticateUserUseCase.execute({
        email: body.email.toLowerCase(),
        password: body.password,
      });

      return reply.status(200).send({ token, user: sanitizeUser(user) });
    } catch (error: unknown) {
      if (error instanceof ApplicationError) {
        return reply.status(error.statusCode).send({ message: error.message });
      }

      request.log.error(
        { err: error },
        "Unexpected error while authenticating user"
      );
      return reply.status(500).send({ message: "Internal server error" });
    }
  }

  async profile(request: AuthenticatedRequest, reply: FastifyReply) {
    if (!request.currentUser) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    return reply.status(200).send({ user: sanitizeUser(request.currentUser) });
  }

  async refresh(request: AuthenticatedRequest, reply: FastifyReply) {
    if (!request.currentUser) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const token = this.tokenService.generate({
      sub: String(request.currentUser.id),
    });

    return reply.status(200).send({ token });
  }
}
