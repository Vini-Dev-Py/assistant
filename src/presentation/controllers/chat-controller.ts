import { CreateChatUseCase } from "@/application/use-cases/create-chat";
import { ApplicationError } from "@/application/errors/application-error";
import { AuthenticatedRequest } from "@/presentation/interfaces/authenticated-request";
import { CreateChatBody } from "@/presentation/interfaces/chat";
import { FastifyReply } from "fastify";
import Joi from "joi";

const validationOptions = {
  abortEarly: false,
  stripUnknown: true,
};

const createChatSchema = Joi.object<CreateChatBody>({
  title: Joi.string().trim().min(1).required(),
});

export class ChatController {
  constructor(private readonly createChatUseCase: CreateChatUseCase) {}

  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    if (!request.currentUser) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const { value, error } = createChatSchema.validate(
      request.body,
      validationOptions,
    );

    if (error) {
      return reply.status(400).send({
        message: "Invalid request body",
        details: error.details.map((detail) => detail.message),
      });
    }

    const body = value as CreateChatBody;

    try {
      const { chat } = await this.createChatUseCase.execute({
        title: body.title.trim(),
        userId: request.currentUser.id,
      });

      return reply.status(201).send({ chat });
    } catch (error: unknown) {
      if (error instanceof ApplicationError) {
        return reply.status(error.statusCode).send({ message: error.message });
      }

      request.log.error({ err: error }, "Unexpected error while creating chat");
      return reply.status(500).send({ message: "Internal server error" });
    }
  }
}
