import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { GameMode as PrismaGameMode, GameStatus as PrismaGameStatus } from '@prisma/client';
import { GameEngine } from '@three-towers/game-engine';
import {
  LAYOUT_VERSION,
  getDailyChallengeDate,
  getDailySeed,
  parseDailyChallengeDate,
} from '@three-towers/shared';
import type {
  DailyAttemptSummary,
  DailyChallengeResponse,
  DailyLeaderboardResponse,
  GameState,
  LeaderboardEntry,
} from '@three-towers/shared';
import { PrismaService } from '../prisma/prisma.service';
import { GamesService } from '../games/games.service';

@Injectable()
export class DailyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamesService: GamesService,
  ) {}

  async getToday(userId: string): Promise<DailyChallengeResponse> {
    const date = getDailyChallengeDate();
    const seed = getDailySeed();
    const challengeDate = parseDailyChallengeDate(date);
    const existing = await this.findDailyAttempt(userId, challengeDate);

    if (!existing) {
      return {
        date,
        seed,
        layoutVersion: LAYOUT_VERSION,
        attempt: null,
        canPlay: true,
      };
    }

    const session = await this.gamesService.getGame(userId, existing.id);
    const attempt = this.toAttemptSummary(existing);

    return {
      date,
      seed,
      layoutVersion: LAYOUT_VERSION,
      attempt,
      canPlay: existing.status === PrismaGameStatus.playing,
      state: session.state,
    };
  }

  async startToday(userId: string): Promise<DailyChallengeResponse> {
    const date = getDailyChallengeDate();
    const seed = getDailySeed();
    const challengeDate = parseDailyChallengeDate(date);
    const existing = await this.findDailyAttempt(userId, challengeDate);

    if (existing) {
      if (existing.status !== PrismaGameStatus.playing) {
        throw new BadRequestException('You have already played today\'s daily challenge');
      }
      return this.getToday(userId);
    }

    const engine = new GameEngine({ mode: 'daily', allowUndo: false, seed });
    const state = engine.init();

    const game = await this.prisma.game.create({
      data: {
        userId,
        seed,
        layoutVersion: LAYOUT_VERSION,
        mode: PrismaGameMode.daily,
        challengeDate,
        status: PrismaGameStatus.playing,
        score: state.score,
        combo: state.combo,
        elapsedMs: 0,
      },
    });

    return {
      date,
      seed,
      layoutVersion: LAYOUT_VERSION,
      attempt: {
        gameId: game.id,
        status: 'playing',
        score: 0,
        elapsedMs: 0,
      },
      canPlay: true,
      state,
    };
  }

  async getLeaderboard(dateStr?: string, limit = 10): Promise<DailyLeaderboardResponse> {
    const date = dateStr ?? getDailyChallengeDate();
    const challengeDate = parseDailyChallengeDate(date);

    const games = await this.prisma.game.findMany({
      where: {
        mode: PrismaGameMode.daily,
        challengeDate,
        status: { in: [PrismaGameStatus.won, PrismaGameStatus.lost] },
      },
      orderBy: [{ score: 'desc' }, { elapsedMs: 'asc' }],
      take: limit,
      include: {
        user: { select: { id: true, username: true } },
      },
    });

    const entries: LeaderboardEntry[] = games.map((game, index) => ({
      rank: index + 1,
      userId: game.user.id,
      username: game.user.username,
      score: game.score,
      elapsedMs: game.elapsedMs,
      finishedAt: game.finishedAt?.toISOString() ?? game.updatedAt.toISOString(),
    }));

    return { date, entries };
  }

  private async findDailyAttempt(userId: string, challengeDate: Date) {
    return this.prisma.game.findUnique({
      where: {
        userId_challengeDate: {
          userId,
          challengeDate,
        },
      },
    });
  }

  private toAttemptSummary(game: {
    id: string;
    status: PrismaGameStatus;
    score: number;
    elapsedMs: number;
    finishedAt: Date | null;
  }): DailyAttemptSummary {
    return {
      gameId: game.id,
      status: this.fromPrismaStatus(game.status),
      score: game.score,
      elapsedMs: game.elapsedMs,
      finishedAt: game.finishedAt?.toISOString(),
    };
  }

  private fromPrismaStatus(status: PrismaGameStatus): GameState['status'] {
    switch (status) {
      case PrismaGameStatus.won:
        return 'won';
      case PrismaGameStatus.lost:
        return 'lost';
      case PrismaGameStatus.abandoned:
        return 'lost';
      default:
        return 'playing';
    }
  }
}
