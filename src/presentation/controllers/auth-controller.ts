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
import Joi from "joi";

const validationOptions = {
  abortEarly: false,
  stripUnknown: true,
};

const registerSchema = Joi.object<RegisterUserBody>({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).required(),
});

const authenticateSchema = Joi.object<AuthenticateUserBody>({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(1).required(),
});

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
    const { value, error } = registerSchema.validate(request.body, validationOptions);

    if (error) {
      return reply.status(400).send({
        message: "Invalid request body",
        details: error.details.map((detail) => detail.message),
      });
    }

    const body = value as RegisterUserBody;

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
    const { value, error } = authenticateSchema.validate(
      request.body,
      validationOptions,
    );

    if (error) {
      return reply.status(400).send({
        message: "Invalid request body",
        details: error.details.map((detail) => detail.message),
      });
    }

    const body = value as AuthenticateUserBody;

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
