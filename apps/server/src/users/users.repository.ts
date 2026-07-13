import type { User } from '@three-towers/shared';
import type { User as PrismaUser } from '@prisma/client';

export interface CreateUserInput {
  email: string;
  username: string;
  passwordHash: string;
  country?: string;
  language?: string;
}

export interface UsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  updatePassword(id: string, passwordHash: string): Promise<User>;
  markEmailVerified(id: string): Promise<User>;
}

export function mapPrismaUser(record: PrismaUser): User {
  return {
    id: record.id,
    email: record.email,
    username: record.username,
    passwordHash: record.passwordHash,
    country: record.country ?? undefined,
    language: record.language ?? undefined,
    avatarUrl: record.avatarUrl ?? undefined,
    emailVerified: record.emailVerified,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
