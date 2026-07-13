import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  getLeaderboard(@Query('mode') mode: 'timed' | 'relaxed' = 'timed') {
    return this.leaderboardService.getLeaderboard(mode);
  }

  @Get('personal')
  @UseGuards(JwtAuthGuard)
  getPersonalBest(
    @Req() req: Request & { user: JwtPayload },
    @Query('mode') mode: 'timed' | 'relaxed' = 'timed',
  ) {
    return this.leaderboardService.getPersonalBest(req.user.sub, mode);
  }
}
