export class GameEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameEngineError';
  }
}

export class InvalidMoveError extends GameEngineError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMoveError';
  }
}

export class GameOverError extends GameEngineError {
  constructor(message: string) {
    super(message);
    this.name = 'GameOverError';
  }
}
