import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class MoveDto {
  @IsIn(['play', 'draw'])
  type!: 'play' | 'draw';

  @IsOptional()
  @IsString()
  cardId?: string;

  @IsInt()
  @Min(0)
  timestamp!: number;
}

export class CreateGameDto {
  @IsIn(['timed', 'relaxed'])
  mode!: 'timed' | 'relaxed';

  @IsOptional()
  @IsInt()
  @Min(1)
  seed?: number;
}

export class SubmitMoveDto {
  @ValidateNested()
  @Type(() => MoveDto)
  move!: MoveDto;

  @IsInt()
  @Min(0)
  elapsedMs!: number;
}
