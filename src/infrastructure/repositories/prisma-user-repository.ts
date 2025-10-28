import { prisma } from "@/infrastructure/database/prisma-client";
import { NewUser, User } from "@/domain/entities/user";
import { UserRepository } from "@/domain/repositories/user-repository";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: NewUser): Promise<User> {
    return prisma.user.create({ data });
  }
}
