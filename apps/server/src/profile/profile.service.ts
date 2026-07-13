import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GameMode as PrismaGameMode,
  GameStatus as PrismaGameStatus,
} from '@prisma/client';
import type {
  GameMode,
  ModeStatistics,
  PlayerStatisticsResponse,
  PlayerTotals,
} from '@three-towers/shared';
import { GamesService } from '../games/games.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

const TRACKED_MODES: GameMode[] = ['timed', 'relaxed', 'daily'];

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly gamesService: GamesService,
  ) {}

  async getStatistics(userId: string): Promise<PlayerStatisticsResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [byMode, recentGames, totalsRow] = await Promise.all([
      Promise.all(TRACKED_MODES.map((mode) => this.getModeStatistics(userId, mode))),
      this.gamesService.listRecentGames(userId, 15),
      this.prisma.game.aggregate({
        where: {
          userId,
          status: { in: [PrismaGameStatus.won, PrismaGameStatus.lost] },
        },
        _count: true,
        _sum: { elapsedMs: true },
      }),
    ]);

    const [wins, losses] = await Promise.all([
      this.prisma.game.count({
        where: { userId, status: PrismaGameStatus.won },
      }),
      this.prisma.game.count({
        where: {
          userId,
          status: { in: [PrismaGameStatus.lost, PrismaGameStatus.abandoned] },
        },
      }),
    ]);

    const gamesPlayed = totalsRow._count;
    const totals: PlayerTotals = {
      gamesPlayed,
      wins,
      losses,
      winRate: gamesPlayed > 0 ? wins / gamesPlayed : 0,
      totalElapsedMs: totalsRow._sum.elapsedMs ?? 0,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        country: user.country ?? undefined,
        language: user.language ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      totals,
      byMode,
      recentGames,
    };
  }

  private async getModeStatistics(userId: string, mode: GameMode): Promise<ModeStatistics> {
    const prismaMode = mode as PrismaGameMode;

    const [wins, losses, bestGame, averages] = await Promise.all([
      this.prisma.game.count({
        where: { userId, mode: prismaMode, status: PrismaGameStatus.won },
      }),
      this.prisma.game.count({
        where: {
          userId,
          mode: prismaMode,
          status: { in: [PrismaGameStatus.lost, PrismaGameStatus.abandoned] },
        },
      }),
      this.prisma.game.findFirst({
        where: { userId, mode: prismaMode, status: PrismaGameStatus.won },
        orderBy: [{ score: 'desc' }, { elapsedMs: 'asc' }],
      }),
      this.prisma.game.aggregate({
        where: { userId, mode: prismaMode, status: PrismaGameStatus.won },
        _avg: { score: true },
        _count: true,
      }),
    ]);

    return {
      mode,
      gamesPlayed: wins + losses,
      wins,
      losses,
      bestScore: bestGame?.score ?? null,
      bestElapsedMs: bestGame?.elapsedMs ?? null,
      averageScore:
        averages._count > 0 && averages._avg.score !== null
          ? Math.round(averages._avg.score)
          : null,
    };
  }
}
