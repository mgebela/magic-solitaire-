import { Module } from '@nestjs/common';
import { GamesModule } from '../games/games.module';
import { DailyController } from './daily.controller';
import { DailyService } from './daily.service';

@Module({
  imports: [GamesModule],
  controllers: [DailyController],
  providers: [DailyService],
})
export class DailyModule {}
