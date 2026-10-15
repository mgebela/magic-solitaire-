import { GameMode as PrismaGameMode, GameStatus as PrismaGameStatus } from '@prisma/client';
import { getDailyChallengeDate, streaksFromDates, type DailyStreak } from '@three-towers/shared';
import { PrismaService } from '../prisma/prisma.service';

export type { DailyStreak };

export async function loadDailyStreak(
  prisma: PrismaService,
  userId: string,
): Promise<DailyStreak> {
  const games = await prisma.game.findMany({
    where: {
      userId,
      mode: PrismaGameMode.daily,
      challengeDate: { not: null },
      status: { in: [PrismaGameStatus.won, PrismaGameStatus.lost] },
    },
    select: { challengeDate: true },
  });

  const dates = games
    .map((game) => game.challengeDate?.toISOString().slice(0, 10))
    .filter((value): value is string => Boolean(value));

  return streaksFromDates(dates, getDailyChallengeDate());
}
