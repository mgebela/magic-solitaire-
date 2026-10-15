import { IsString, IsOptional, IsIn } from 'class-validator';

export class WalletNonceDto {
  @IsString()
  address!: string;

  @IsOptional()
  @IsIn(['ethereum', 'solana'])
  chain?: 'ethereum' | 'solana';
}

export class WalletVerifyDto {
  @IsString()
  message!: string;

  @IsString()
  signature!: string;

  @IsOptional()
  @IsIn(['ethereum', 'solana'])
  chain?: 'ethereum' | 'solana';
}
