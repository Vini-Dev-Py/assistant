import { NewUser, User } from "@/domain/entities/user";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(data: NewUser): Promise<User>;
}
