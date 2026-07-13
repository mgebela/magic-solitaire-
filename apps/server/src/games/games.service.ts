import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GameMode as PrismaGameMode, GameStatus as PrismaGameStatus } from '@prisma/client';
import {
  GameEngine,
  InvalidMoveError,
  GameOverError,
  replayGame,
} from '@three-towers/game-engine';
import { LAYOUT_VERSION } from '@three-towers/shared';
import type {
  CreateGameRequest,
  GameSessionResponse,
  GameState,
  GameSummary,
  Move,
  MoveResponse,
  SinglePlayerMode,
} from '@three-towers/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async createGame(userId: string, dto: CreateGameRequest): Promise<GameSessionResponse> {
    const engine = new GameEngine({
      mode: dto.mode,
      allowUndo: false,
      seed: dto.seed,
    });
    const state = engine.init();

    const game = await this.prisma.game.create({
      data: {
        userId,
        seed: state.seed,
        layoutVersion: LAYOUT_VERSION,
        mode: dto.mode as PrismaGameMode,
        status: PrismaGameStatus.playing,
        score: state.score,
        combo: state.combo,
        elapsedMs: 0,
      },
    });

    return this.toSession(game.id, state, dto.mode, game.startedAt, null);
  }

  async getGame(userId: string, gameId: string): Promise<GameSessionResponse> {
    const game = await this.findOwnedGame(userId, gameId);
    const moves = await this.loadMoves(gameId);
    const engine = this.buildEngine(game, moves);
    const state = engine.getState();

    return this.toSession(
      game.id,
      state,
      game.mode as SinglePlayerMode,
      game.startedAt,
      game.finishedAt,
    );
  }

  async submitMove(
    userId: string,
    gameId: string,
    move: Move,
    elapsedMs: number,
  ): Promise<MoveResponse> {
    const game = await this.findOwnedGame(userId, gameId);

    if (game.status !== PrismaGameStatus.playing) {
      throw new BadRequestException(`Game is already ${game.status}`);
    }

    const existingMoves = await this.loadMoves(gameId);
    const engine = this.buildEngine(game, existingMoves);
    const before = engine.getState();

    try {
      engine.applyMove(move);
      engine.setElapsedMs(elapsedMs);
      const after = engine.getState();

      const scoreDelta = after.score - before.score;
      const nextSequence = existingMoves.length + 1;

      await this.prisma.$transaction([
        this.prisma.move.create({
          data: {
            gameId,
            userId,
            type: move.type,
            cardId: move.type === 'play' ? move.cardId : null,
            timestamp: new Date(move.timestamp),
            sequence: nextSequence,
          },
        }),
        this.prisma.game.update({
          where: { id: gameId },
          data: {
            score: after.score,
            combo: after.combo,
            elapsedMs,
            status: this.toPrismaStatus(after.status),
            finishedAt:
              after.status === 'won' || after.status === 'lost' ? new Date() : null,
          },
        }),
      ]);

      return {
        accepted: true,
        state: after,
        scoreDelta,
        combo: after.combo,
        scoreBreakdown: after.scoreBreakdown,
      };
    } catch (err) {
      if (err instanceof InvalidMoveError || err instanceof GameOverError) {
        return { accepted: false, error: err.message };
      }
      throw err;
    }
  }

  async listRecentGames(userId: string, limit = 10): Promise<GameSummary[]> {
    const games = await this.prisma.game.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return games.map((game) => ({
      id: game.id,
      mode: game.mode,
      status: this.fromPrismaStatus(game.status),
      score: game.score,
      elapsedMs: game.elapsedMs,
      startedAt: game.startedAt.toISOString(),
      finishedAt: game.finishedAt?.toISOString(),
    }));
  }

  private async findOwnedGame(userId: string, gameId: string) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    if (game.userId !== userId) {
      throw new ForbiddenException('You do not have access to this game');
    }

    return game;
  }

  private async loadMoves(gameId: string) {
    return this.prisma.move.findMany({
      where: { gameId },
      orderBy: { sequence: 'asc' },
    });
  }

  private buildEngine(
    game: {
      seed: number;
      mode: PrismaGameMode;
      elapsedMs: number;
    },
    dbMoves: Array<{
      type: 'play' | 'draw';
      cardId: string | null;
      timestamp: Date;
    }>,
  ): GameEngine {
    const moves: Move[] = dbMoves.map((m) =>
      m.type === 'play'
        ? { type: 'play', cardId: m.cardId!, timestamp: m.timestamp.getTime() }
        : { type: 'draw', timestamp: m.timestamp.getTime() },
    );

    return replayGame(
      {
        mode: game.mode,
        allowUndo: false,
        seed: game.seed,
      },
      moves,
      game.elapsedMs,
    );
  }

  private toSession(
    id: string,
    state: GameState,
    mode: SinglePlayerMode,
    startedAt: Date,
    finishedAt: Date | null,
  ): GameSessionResponse {
    return {
      id,
      state,
      mode,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt?.toISOString(),
    };
  }

  private toPrismaStatus(status: GameState['status']): PrismaGameStatus {
    switch (status) {
      case 'won':
        return PrismaGameStatus.won;
      case 'lost':
        return PrismaGameStatus.lost;
      default:
        return PrismaGameStatus.playing;
    }
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
