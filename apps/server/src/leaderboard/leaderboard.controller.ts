import { BadRequestException, Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { LeaderboardPeriod } from '@three-towers/shared';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { LeaderboardService } from './leaderboard.service';

const PERIODS: LeaderboardPeriod[] = ['today', 'week', 'month'];

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  getLeaderboard(@Query('mode') mode: 'timed' | 'relaxed' = 'timed') {
    return this.leaderboardService.getLeaderboard(mode);
  }

  @Get('top')
  @UseGuards(OptionalJwtAuthGuard)
  getTopScores(
    @Query('period') period = 'today',
    @Req() req: Request & { user?: JwtPayload },
  ) {
    if (!PERIODS.includes(period as LeaderboardPeriod)) {
      throw new BadRequestException('Period must be today, week, or month');
    }
    return this.leaderboardService.getTopScores(period as LeaderboardPeriod, req.user?.sub);
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
