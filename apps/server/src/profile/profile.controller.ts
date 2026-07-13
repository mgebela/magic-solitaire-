import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('stats')
  getStats(@Req() req: Request & { user: JwtPayload }) {
    return this.profileService.getStatistics(req.user.sub);
  }
}
