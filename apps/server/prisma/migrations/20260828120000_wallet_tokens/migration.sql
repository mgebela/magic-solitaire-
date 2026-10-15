-- Wallet auth + Solitaire Token economy

CREATE TYPE "AuthMethod" AS ENUM ('email', 'wallet');
CREATE TYPE "WalletChain" AS ENUM ('ethereum', 'solana');
CREATE TYPE "TokenTransactionType" AS ENUM ('purchase', 'multiplayer_entry', 'grant', 'refund');
CREATE TYPE "TokenTransactionStatus" AS ENUM ('pending', 'completed', 'failed');

ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;
ALTER TABLE "users" ADD COLUMN "wallet_address" TEXT;
ALTER TABLE "users" ADD COLUMN "wallet_chain" "WalletChain";
ALTER TABLE "users" ADD COLUMN "auth_method" "AuthMethod" NOT NULL DEFAULT 'email';
ALTER TABLE "users" ADD COLUMN "token_balance" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

CREATE TABLE "wallet_nonces" (
    "id" UUID NOT NULL,
    "address" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wallet_nonces_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wallet_nonces_address_key" ON "wallet_nonces"("address");
CREATE INDEX "wallet_nonces_expires_at_idx" ON "wallet_nonces"("expires_at");

CREATE TABLE "token_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "TokenTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "package_id" TEXT,
    "crypto_tx_hash" TEXT,
    "crypto_amount" TEXT,
    "status" "TokenTransactionStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "token_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "token_transactions_user_id_idx" ON "token_transactions"("user_id");
CREATE INDEX "token_transactions_crypto_tx_hash_idx" ON "token_transactions"("crypto_tx_hash");

ALTER TABLE "token_transactions" ADD CONSTRAINT "token_transactions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
