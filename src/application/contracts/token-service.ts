export interface TokenPayload {
  sub: string;
  [key: string]: unknown;
}

export interface TokenGenerationOptions {
  expiresIn?: string | number;
}

export interface TokenService {
  generate(payload: TokenPayload, options?: TokenGenerationOptions): string;
  verify<T extends TokenPayload = TokenPayload>(token: string): T;
}
