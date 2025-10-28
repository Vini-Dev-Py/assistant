import { TokenService } from "@/application/contracts/token-service";
import { UserRepository } from "@/domain/repositories/user-repository";
import { AuthenticatedRequest } from "@/presentation/interfaces/authenticated-request";
import { FastifyReply } from "fastify";

export function createAuthMiddleware(
  tokenService: TokenService,
  userRepository: UserRepository,
) {
  return async function authMiddleware(request: AuthenticatedRequest, reply: FastifyReply) {
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const token = authorization.substring("Bearer ".length).trim();

    if (!token) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    try {
      const payload = tokenService.verify(token);
      const userId = Number(payload.sub);

      if (!Number.isFinite(userId)) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const user = await userRepository.findById(userId);

      if (!user) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      request.currentUser = user;
    } catch (error) {
      request.log.warn({ err: error }, "Failed to verify token");
      return reply.status(401).send({ message: "Unauthorized" });
    }
  };
}
