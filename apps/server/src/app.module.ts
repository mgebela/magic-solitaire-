import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { DailyModule } from './daily/daily.module';
import { GamesModule } from './games/games.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { MultiplayerModule } from './multiplayer/multiplayer.module';
import { ProfileModule } from './profile/profile.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    GamesModule,
    DailyModule,
    LeaderboardModule,
    ProfileModule,
    MultiplayerModule,
  ],
  controllers: [AppController, HealthController],
})
export class AppModule {}
