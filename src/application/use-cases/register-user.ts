import { PasswordHasher } from "@/application/contracts/password-hasher";
import { UserAlreadyExistsError } from "@/application/errors/user-already-exists-error";
import { UserRepository } from "@/domain/repositories/user-repository";
import { User } from "@/domain/entities/user";

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

interface RegisterUserOutput {
  user: User;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute({ name, email, password }: RegisterUserInput): Promise<RegisterUserOutput> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    return { user };
  }
}
