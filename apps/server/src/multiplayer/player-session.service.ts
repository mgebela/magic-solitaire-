import { Injectable } from '@nestjs/common';
import {
  GameEngine,
  GameOverError,
  InvalidMoveError,
} from '@three-towers/game-engine';
import type { GameState, Move, MoveResponse } from '@three-towers/shared';
import type { InternalRoom } from './room.service';

@Injectable()
export class PlayerSessionService {
  private readonly engines = new Map<string, GameEngine>();

  private sessionKey(roomId: string, userId: string): string {
    return `${roomId}:${userId}`;
  }

  initPlayer(room: InternalRoom, userId: string): GameState {
    if (!room.seed) throw new Error('Room has no seed');

    const engine = new GameEngine({
      mode: room.mode,
      allowUndo: false,
      seed: room.seed,
    });
    const state = engine.init();

    this.engines.set(this.sessionKey(room.id, userId), engine);
    return state;
  }

  applyMove(
    room: InternalRoom,
    userId: string,
    move: Move,
    elapsedMs: number,
  ): MoveResponse {
    const engine = this.engines.get(this.sessionKey(room.id, userId));
    if (!engine) {
      return { accepted: false, error: 'Session not found' };
    }

    const before = engine.getState();

    try {
      engine.applyMove(move);
      engine.setElapsedMs(elapsedMs);
      const after = engine.getState();

      return {
        accepted: true,
        state: after,
        scoreDelta: after.score - before.score,
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

  syncElapsed(roomId: string, userId: string, elapsedMs: number): GameState | null {
    const engine = this.engines.get(this.sessionKey(roomId, userId));
    if (!engine) return null;
    return engine.setElapsedMs(elapsedMs);
  }

  clearRoom(roomId: string): void {
    for (const key of this.engines.keys()) {
      if (key.startsWith(`${roomId}:`)) {
        this.engines.delete(key);
      }
    }
  }
}
