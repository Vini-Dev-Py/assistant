import jwt, { SignOptions } from "jsonwebtoken";
import {
  TokenGenerationOptions,
  TokenPayload,
  TokenService,
} from "@/application/contracts/token-service";

const DEFAULT_EXPIRATION: string = "1h";

type ResolvedExpiration = NonNullable<SignOptions["expiresIn"]>;

export class JwtTokenService implements TokenService {
  constructor(private readonly secret: string) {
    if (!secret) {
      throw new Error("JWT secret must be provided");
    }
  }

  generate(payload: TokenPayload, options?: TokenGenerationOptions): string {
    const expiresInValue = (options?.expiresIn ?? DEFAULT_EXPIRATION) as ResolvedExpiration;
    const signOptions: SignOptions = { expiresIn: expiresInValue };

    return jwt.sign(payload, this.secret, signOptions);
  }

  verify<T extends TokenPayload = TokenPayload>(token: string): T {
    return jwt.verify(token, this.secret) as T;
  }
}
