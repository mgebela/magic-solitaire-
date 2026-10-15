import { Inject, Injectable } from '@nestjs/common';
import type { User, UserPublic } from '@three-towers/shared';
import {
  CreateUserInput,
  USERS_REPOSITORY,
  UsersRepository,
} from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly repository: UsersRepository,
  ) {}

  toPublic(user: User): UserPublic {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      walletAddress: user.walletAddress,
      walletChain: user.walletChain,
      authMethod: user.authMethod,
      tokenBalance: user.tokenBalance,
      country: user.country,
      language: user.language,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  findById(id: string): Promise<User | null> {
    return this.repository.findById(id);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }

  findByUsername(username: string): Promise<User | null> {
    return this.repository.findByUsername(username);
  }

  findByWalletAddress(address: string): Promise<User | null> {
    return this.repository.findByWalletAddress(address);
  }

  create(input: CreateUserInput): Promise<User> {
    return this.repository.create(input);
  }

  updatePassword(id: string, passwordHash: string): Promise<User> {
    return this.repository.updatePassword(id, passwordHash);
  }

  markEmailVerified(id: string): Promise<User> {
    return this.repository.markEmailVerified(id);
  }

  adjustTokenBalance(id: string, delta: number): Promise<User> {
    return this.repository.adjustTokenBalance(id, delta);
  }
}
