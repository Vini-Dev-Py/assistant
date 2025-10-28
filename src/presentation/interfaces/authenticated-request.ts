import type { User } from "@/domain/entities/user";
import type { FastifyRequest } from "fastify";

export type AuthenticatedRequest = FastifyRequest & {
  currentUser?: User;
};
