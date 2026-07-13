import { Injectable } from '@nestjs/common';
import type { User } from '@three-towers/shared';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserInput,
  mapPrismaUser,
  UsersRepository,
} from './users.repository';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? mapPrismaUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user ? mapPrismaUser(user) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { username: { equals: username, mode: 'insensitive' } },
    });
    return user ? mapPrismaUser(user) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        username: input.username,
        passwordHash: input.passwordHash,
        country: input.country,
        language: input.language,
      },
    });
    return mapPrismaUser(user);
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
    return mapPrismaUser(user);
  }

  async markEmailVerified(id: string): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { emailVerified: true },
    });
    return mapPrismaUser(user);
  }
}
