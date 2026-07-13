import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { MultiplayerGateway } from './multiplayer.gateway';
import { PlayerSessionService } from './player-session.service';
import { RoomService } from './room.service';

@Module({
  imports: [AuthModule, UsersModule],
  providers: [RoomService, PlayerSessionService, MultiplayerGateway],
})
export class MultiplayerModule {}
