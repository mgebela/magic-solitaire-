import { Injectable } from '@nestjs/common';
import { GameMode as PrismaGameMode, GameStatus as PrismaGameStatus } from '@prisma/client';
import type { LeaderboardEntry, PersonalBestResponse, SinglePlayerMode } from '@three-towers/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(
    mode: SinglePlayerMode,
    limit = 10,
  ): Promise<LeaderboardEntry[]> {
    const games = await this.prisma.game.findMany({
      where: {
        mode: mode as PrismaGameMode,
        status: PrismaGameStatus.won,
      },
      orderBy: [{ score: 'desc' }, { elapsedMs: 'asc' }],
      take: limit,
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    return games.map((game, index) => ({
      rank: index + 1,
      userId: game.user.id,
      username: game.user.username,
      score: game.score,
      elapsedMs: game.elapsedMs,
      finishedAt: game.finishedAt?.toISOString() ?? game.updatedAt.toISOString(),
    }));
  }

  async getPersonalBest(
    userId: string,
    mode: SinglePlayerMode,
  ): Promise<PersonalBestResponse> {
    const bestGame = await this.prisma.game.findFirst({
      where: {
        userId,
        mode: mode as PrismaGameMode,
        status: PrismaGameStatus.won,
      },
      orderBy: [{ score: 'desc' }, { elapsedMs: 'asc' }],
    });

    const [totalWins, gamesPlayed, betterCount] = await Promise.all([
      this.prisma.game.count({
        where: {
          userId,
          mode: mode as PrismaGameMode,
          status: PrismaGameStatus.won,
        },
      }),
      this.prisma.game.count({
        where: {
          userId,
          mode: mode as PrismaGameMode,
        },
      }),
      bestGame
        ? this.prisma.game.count({
            where: {
              mode: mode as PrismaGameMode,
              status: PrismaGameStatus.won,
              OR: [
                { score: { gt: bestGame.score } },
                {
                  score: bestGame.score,
                  elapsedMs: { lt: bestGame.elapsedMs },
                },
              ],
            },
          })
        : Promise.resolve(0),
    ]);

    return {
      mode,
      bestScore: bestGame?.score ?? null,
      bestElapsedMs: bestGame?.elapsedMs ?? null,
      rank: bestGame ? betterCount + 1 : null,
      totalWins,
      gamesPlayed,
    };
  }
}
