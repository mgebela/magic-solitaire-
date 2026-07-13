import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGameDto, SubmitMoveDto } from './dto/games.dto';
import { GamesService } from './games.service';

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(@Req() req: Request & { user: JwtPayload }, @Body() dto: CreateGameDto) {
    return this.gamesService.createGame(req.user.sub, dto);
  }

  @Get('recent')
  listRecent(@Req() req: Request & { user: JwtPayload }) {
    return this.gamesService.listRecentGames(req.user.sub);
  }

  @Get(':id')
  getOne(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.gamesService.getGame(req.user.sub, id);
  }

  @Post(':id/moves')
  submitMove(
    @Req() req: Request & { user: JwtPayload },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SubmitMoveDto,
  ) {
    const move =
      dto.move.type === 'play'
        ? { type: 'play' as const, cardId: dto.move.cardId!, timestamp: dto.move.timestamp }
        : { type: 'draw' as const, timestamp: dto.move.timestamp };

    return this.gamesService.submitMove(req.user.sub, id, move, dto.elapsedMs);
  }
}
