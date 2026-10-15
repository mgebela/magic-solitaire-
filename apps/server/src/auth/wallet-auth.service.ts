import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { randomBytes } from 'crypto';
import nacl from 'tweetnacl';
import type { AuthResponse, WalletNonceResponse } from '@three-towers/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const WELCOME_TOKEN_GRANT = 25;

@Injectable()
export class WalletAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  async createNonce(address: string): Promise<WalletNonceResponse> {
    const pubkey = this.parseSolanaAddress(address);
    const normalized = pubkey.toBase58();
    const nonce = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.walletNonce.upsert({
      where: { address: normalized },
      create: { address: normalized, nonce, expiresAt },
      update: { nonce, expiresAt },
    });

    const message = this.buildSignInMessage(normalized, nonce);
    const network = this.config.get<string>('SOLANA_NETWORK', 'devnet') as
      | 'mainnet-beta'
      | 'devnet';

    return { nonce, message, network };
  }

  async verifyWallet(message: string, signature: string): Promise<AuthResponse> {
    const address = this.extractAddressFromMessage(message);
    if (!address) {
      throw new UnauthorizedException('Invalid sign-in message');
    }

    const pubkey = this.parseSolanaAddress(address);
    const normalized = pubkey.toBase58();

    const stored = await this.prisma.walletNonce.findUnique({
      where: { address: normalized },
    });

    if (!stored) {
      throw new UnauthorizedException('No pending sign-in — request a nonce first');
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Sign-in expired — request a new wallet nonce');
    }

    const expectedMessage = this.buildSignInMessage(normalized, stored.nonce);
    if (message !== expectedMessage) {
      throw new UnauthorizedException('Sign-in message does not match server nonce');
    }

    const valid = this.verifySignature(message, signature, pubkey);
    if (!valid) {
      throw new UnauthorizedException('Invalid Solana wallet signature');
    }

    await this.prisma.walletNonce.delete({ where: { address: normalized } });

    let user = await this.usersService.findByWalletAddress(normalized);
    if (!user) {
      const baseUsername = `player_${normalized.slice(0, 6)}`;
      let username = baseUsername;
      let suffix = 1;
      while (await this.usersService.findByUsername(username)) {
        username = `${baseUsername}${suffix}`;
        suffix++;
      }

      user = await this.usersService.create({
        username,
        walletAddress: normalized,
        walletChain: 'solana',
        authMethod: 'wallet',
      });

      await this.usersService.adjustTokenBalance(user.id, WELCOME_TOKEN_GRANT);
      user = await this.usersService.findById(user.id);
      if (!user) {
        throw new BadRequestException('Failed to create wallet user');
      }
    }

    return this.authService.loginWithUser(user);
  }

  private buildSignInMessage(address: string, nonce: string): string {
    return [
      'Sign in to Three Towers Solitaire',
      `Wallet: ${address}`,
      `Nonce: ${nonce}`,
    ].join('\n');
  }

  private extractAddressFromMessage(message: string): string | null {
    const match = message.match(/^Wallet: ([1-9A-HJ-NP-Za-km-z]{32,44})$/m);
    return match?.[1] ?? null;
  }

  private parseSolanaAddress(address: string): PublicKey {
    try {
      return new PublicKey(address);
    } catch {
      throw new BadRequestException('Invalid Solana wallet address');
    }
  }

  private verifySignature(message: string, signatureBase58: string, pubkey: PublicKey): boolean {
    try {
      const signature = bs58.decode(signatureBase58);
      const messageBytes = new TextEncoder().encode(message);
      return nacl.sign.detached.verify(messageBytes, signature, pubkey.toBytes());
    } catch {
      return false;
    }
  }
}
