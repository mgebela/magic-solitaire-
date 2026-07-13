-- AlterTable
ALTER TABLE "games" ADD COLUMN "challenge_date" DATE;

-- CreateIndex
CREATE INDEX "games_challenge_date_idx" ON "games"("challenge_date");

-- CreateIndex
CREATE UNIQUE INDEX "games_user_id_challenge_date_key" ON "games"("user_id", "challenge_date");
