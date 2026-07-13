import { Module } from '@nestjs/common';
import { GamesModule } from '../games/games.module';
import { UsersModule } from '../users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [UsersModule, GamesModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
