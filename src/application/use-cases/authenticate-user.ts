import { PasswordHasher } from "@/application/contracts/password-hasher";
import { TokenService } from "@/application/contracts/token-service";
import { InvalidCredentialsError } from "@/application/errors/invalid-credentials-error";
import { User } from "@/domain/entities/user";
import { UserRepository } from "@/domain/repositories/user-repository";

interface AuthenticateUserInput {
  email: string;
  password: string;
}

interface AuthenticateUserOutput {
  token: string;
  user: User;
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute({ email, password }: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(password, user.password);

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokenService.generate({ sub: String(user.id) });

    return { token, user };
  }
}
