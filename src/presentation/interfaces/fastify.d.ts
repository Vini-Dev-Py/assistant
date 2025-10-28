import "fastify";
import { User } from "@/domain/entities/user";

declare module "fastify" {
  interface FastifyRequest {
    currentUser?: User;
  }
}
