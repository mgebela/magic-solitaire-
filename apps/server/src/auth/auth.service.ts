import { randomBytes } from 'crypto';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import type {
  AuthResponse,
  AuthTokens,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UserPublic,
} from '@three-towers/shared';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './auth.types';

@Injectable()
export class AuthService {
  private readonly accessExpiresIn: number;
  private readonly refreshExpiresIn: number;
  private readonly bcryptRounds = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.accessExpiresIn = Number(this.configService.get('JWT_ACCESS_EXPIRES_IN', 900));
    this.refreshExpiresIn = Number(this.configService.get('JWT_REFRESH_EXPIRES_IN', 604800));
  }

  async register(dto: RegisterRequest): Promise<AuthResponse> {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername = await this.usersService.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
      country: dto.country,
      language: dto.language,
    });

    const verificationToken = randomBytes(32).toString('hex');
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log(
        `[auth] Email verification token for ${user.email}: ${verificationToken}`,
      );
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.usersService.toPublic(user), tokens };
  }

  async login(dto: LoginRequest): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(user.id, user.email);
    return { user: this.usersService.toPublic(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (
      !stored ||
      stored.userId !== payload.sub ||
      stored.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens(user.id, user.email);
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string): Promise<UserPublic> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.usersService.toPublic(user);
  }

  async forgotPassword(dto: ForgotPasswordRequest): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    const message =
      'If an account exists with that email, a password reset link has been sent.';

    if (!user) {
      return { message };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await this.prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const clientUrl = this.configService.get('CLIENT_URL', 'http://localhost:5173');
    const resetUrl = `${clientUrl}/reset-password?token=${token}`;

    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log(`[auth] Password reset for ${user.email}: ${resetUrl}`);
    }

    return { message };
  }

  async resetPassword(dto: ResetPasswordRequest): Promise<{ message: string }> {
    const entry = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
    });

    if (!entry || entry.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptRounds);
    await this.usersService.updatePassword(entry.userId, passwordHash);
    await this.prisma.passwordResetToken.delete({ where: { id: entry.id } });

    return { message: 'Password reset successfully' };
  }

  getGoogleOAuthStub() {
    return this.getOAuthStub('google', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET');
  }

  getDiscordOAuthStub() {
    return this.getOAuthStub('discord', 'DISCORD_CLIENT_ID', 'DISCORD_CLIENT_SECRET');
  }

  private getOAuthStub(
    provider: 'google' | 'discord',
    clientIdKey: string,
    clientSecretKey: string,
  ) {
    const clientId = this.configService.get<string>(clientIdKey);
    const clientSecret = this.configService.get<string>(clientSecretKey);
    const configured = Boolean(clientId && clientSecret);

    const apiUrl = this.configService.get('API_URL', 'http://localhost:3000');
    const authorizationUrl = configured
      ? `${apiUrl}/api/auth/${provider}/callback`
      : undefined;

    return {
      provider,
      configured,
      message: configured
        ? `${provider} OAuth is configured. Full OAuth flow will be enabled in a future update.`
        : `${provider} OAuth is not configured. Set ${clientIdKey} and ${clientSecretKey} in .env.`,
      authorizationUrl,
    };
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessPayload: JwtPayload = { sub: userId, email, type: 'access' };
    const refreshPayload: JwtPayload = { sub: userId, email, type: 'refresh' };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.accessExpiresIn,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.refreshExpiresIn,
    });

    const expiresAt = new Date(Date.now() + this.refreshExpiresIn * 1000);
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiresIn,
    };
  }
}
