import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DailyService } from './daily.service';

@Controller('daily')
export class DailyController {
  constructor(private readonly dailyService: DailyService) {}

  @Get('today')
  @UseGuards(JwtAuthGuard)
  getToday(@Req() req: Request & { user: JwtPayload }) {
    return this.dailyService.getToday(req.user.sub);
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  startToday(@Req() req: Request & { user: JwtPayload }) {
    return this.dailyService.startToday(req.user.sub);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('date') date?: string) {
    return this.dailyService.getLeaderboard(date);
  }
}
