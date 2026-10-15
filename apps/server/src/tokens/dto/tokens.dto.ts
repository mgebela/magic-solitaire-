import { IsString, IsOptional } from 'class-validator';

export class PurchaseTokensDto {
  @IsString()
  packageId!: string;

  @IsOptional()
  @IsString()
  cryptoTxHash?: string;
}

export class ConfirmPurchaseDto {
  @IsString()
  transactionId!: string;

  @IsString()
  cryptoTxHash!: string;
}
