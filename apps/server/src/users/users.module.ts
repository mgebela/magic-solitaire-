import { Module } from '@nestjs/common';
import { PrismaUsersRepository } from './prisma-users.repository';
import { USERS_REPOSITORY } from './users.repository';
import { UsersService } from './users.service';

@Module({
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
