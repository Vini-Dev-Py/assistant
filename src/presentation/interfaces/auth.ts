export interface RegisterUserBody {
  name: string;
  email: string;
  password: string;
}

export interface AuthenticateUserBody {
  email: string;
  password: string;
}
