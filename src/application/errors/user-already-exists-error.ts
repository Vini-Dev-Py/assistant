import { ApplicationError } from "@/application/errors/application-error";

export class UserAlreadyExistsError extends ApplicationError {
  constructor(email: string) {
    super(`User with email ${email} already exists`, 409);
  }
}
