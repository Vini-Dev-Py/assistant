export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewUser = Pick<User, "name" | "email" | "password">;
