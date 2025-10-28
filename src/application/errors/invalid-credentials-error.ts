import { ApplicationError } from "@/application/errors/application-error";

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super("Invalid credentials", 401);
  }
}
