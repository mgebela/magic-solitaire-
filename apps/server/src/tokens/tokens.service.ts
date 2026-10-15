import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MULTIPLAYER_ENTRY_COST,
  TOKEN_PACKAGES,
  type PurchaseTokensRequest,
  type PurchaseTokensResponse,
  type TokenBalanceResponse,
  type TokenTransactionPublic,
} from '@three-towers/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class TokensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  getPackages() {
    return {
      packages: TOKEN_PACKAGES,
      treasuryAddress: this.config.get<string>('CRYPTO_TREASURY_ADDRESS', ''),
      multiplayerEntryCost: MULTIPLAYER_ENTRY_COST,
    };
  }

  async getBalance(userId: string): Promise<TokenBalanceResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    return {
      balance: user.tokenBalance,
      multiplayerEntryCost: MULTIPLAYER_ENTRY_COST,
    };
  }

  async purchase(
    userId: string,
    dto: PurchaseTokensRequest,
  ): Promise<PurchaseTokensResponse> {
    const pkg = TOKEN_PACKAGES.find((p) => p.id === dto.packageId);
    if (!pkg) {
      throw new BadRequestException('Invalid token package');
    }

    const isDev = this.config.get('NODE_ENV') !== 'production';
    const autoComplete = isDev && !dto.cryptoTxHash;

    if (!dto.cryptoTxHash && !isDev) {
      const treasury = this.config.get<string>('CRYPTO_TREASURY_ADDRESS');
      if (!treasury) {
        throw new BadRequestException('Crypto payments are not configured');
      }
      return {
        transactionId: '',
        status: 'pending',
        treasuryAddress: treasury,
        cryptoAmount: pkg.cryptoAmount,
        message: `Send ${pkg.cryptoAmount} SOL to the treasury address, then confirm with your transaction signature.`,
      };
    }

    const tx = await this.prisma.tokenTransaction.create({
      data: {
        userId,
        type: 'purchase',
        amount: pkg.tokens,
        balanceAfter: 0,
        packageId: pkg.id,
        cryptoTxHash: dto.cryptoTxHash ?? null,
        cryptoAmount: pkg.cryptoAmount,
        status: autoComplete ? 'completed' : 'pending',
      },
    });

    if (autoComplete) {
      const user = await this.usersService.adjustTokenBalance(userId, pkg.tokens);
      await this.prisma.tokenTransaction.update({
        where: { id: tx.id },
        data: { balanceAfter: user.tokenBalance },
      });

      return {
        transactionId: tx.id,
        status: 'completed',
        tokensGranted: pkg.tokens,
        balance: user.tokenBalance,
        message: `${pkg.tokens} Solitaire Tokens credited (dev mode).`,
      };
    }

    return {
      transactionId: tx.id,
      status: 'pending',
      treasuryAddress: this.config.get<string>('CRYPTO_TREASURY_ADDRESS'),
      cryptoAmount: pkg.cryptoAmount,
      message: 'Payment pending on-chain confirmation.',
    };
  }

  async confirmPurchase(
    userId: string,
    transactionId: string,
    cryptoTxHash: string,
  ): Promise<PurchaseTokensResponse> {
    const tx = await this.prisma.tokenTransaction.findFirst({
      where: { id: transactionId, userId, status: 'pending', type: 'purchase' },
    });

    if (!tx) {
      throw new NotFoundException('Pending purchase not found');
    }

    const existing = await this.prisma.tokenTransaction.findFirst({
      where: { cryptoTxHash, status: 'completed' },
    });
    if (existing) {
      throw new BadRequestException('Transaction hash already used');
    }

    // MVP: trust submitted hash (production should verify on-chain via viem/ethers)
    const user = await this.usersService.adjustTokenBalance(userId, tx.amount);
    const updated = await this.prisma.tokenTransaction.update({
      where: { id: tx.id },
      data: {
        status: 'completed',
        cryptoTxHash,
        balanceAfter: user.tokenBalance,
      },
    });

    return {
      transactionId: updated.id,
      status: 'completed',
      tokensGranted: tx.amount,
      balance: user.tokenBalance,
      message: `${tx.amount} Solitaire Tokens credited.`,
    };
  }

  async listTransactions(userId: string): Promise<TokenTransactionPublic[]> {
    const rows = await this.prisma.tokenTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      amount: row.amount,
      balanceAfter: row.balanceAfter,
      status: row.status,
      packageId: row.packageId ?? undefined,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async canEnterMultiplayer(userId: string): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) return false;
    return user.tokenBalance >= MULTIPLAYER_ENTRY_COST;
  }

  async deductMultiplayerEntry(userId: string): Promise<number> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.tokenBalance < MULTIPLAYER_ENTRY_COST) {
      throw new BadRequestException(
        `Need ${MULTIPLAYER_ENTRY_COST} Solitaire Tokens to enter multiplayer`,
      );
    }

    const updated = await this.usersService.adjustTokenBalance(
      userId,
      -MULTIPLAYER_ENTRY_COST,
    );

    await this.prisma.tokenTransaction.create({
      data: {
        userId,
        type: 'multiplayer_entry',
        amount: -MULTIPLAYER_ENTRY_COST,
        balanceAfter: updated.tokenBalance,
        status: 'completed',
      },
    });

    return updated.tokenBalance;
  }
}
