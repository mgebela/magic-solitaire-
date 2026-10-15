import { Injectable, BadRequestException } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
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

  async findByWalletAddress(address: string): Promise<User | null> {
    const normalized = this.normalizeWalletAddress(address);
    const user = await this.prisma.user.findUnique({
      where: { walletAddress: normalized },
    });
    return user ? mapPrismaUser(user) : null;
  }

  private normalizeWalletAddress(address: string): string {
    try {
      return new PublicKey(address).toBase58();
    } catch {
      return address;
    }
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email?.toLowerCase() ?? null,
        username: input.username,
        passwordHash: input.passwordHash ?? null,
        walletAddress: input.walletAddress
          ? this.normalizeWalletAddress(input.walletAddress)
          : null,
        walletChain: input.walletChain ?? null,
        authMethod: input.authMethod,
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

  async adjustTokenBalance(id: string, delta: number): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new BadRequestException('User not found');

    const newBalance = user.tokenBalance + delta;
    if (newBalance < 0) {
      throw new BadRequestException('Insufficient token balance');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { tokenBalance: newBalance },
    });
    return mapPrismaUser(updated);
  }
}
