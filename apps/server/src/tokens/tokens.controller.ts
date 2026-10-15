import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { MULTIPLAYER_ENTRY_COST } from '@three-towers/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.types';
import { ConfirmPurchaseDto, PurchaseTokensDto } from './dto/tokens.dto';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get('packages')
  listPackages() {
    return this.tokensService.getPackages();
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  getBalance(@Req() req: Request & { user: JwtPayload }) {
    return this.tokensService.getBalance(req.user.sub);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  listTransactions(@Req() req: Request & { user: JwtPayload }) {
    return this.tokensService.listTransactions(req.user.sub);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  purchase(@Req() req: Request & { user: JwtPayload }, @Body() dto: PurchaseTokensDto) {
    return this.tokensService.purchase(req.user.sub, dto);
  }

  @Post('purchase/confirm')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  confirmPurchase(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: ConfirmPurchaseDto,
  ) {
    return this.tokensService.confirmPurchase(
      req.user.sub,
      dto.transactionId,
      dto.cryptoTxHash,
    );
  }

  @Get('multiplayer/can-enter')
  @UseGuards(JwtAuthGuard)
  canEnterMultiplayer(@Req() req: Request & { user: JwtPayload }) {
    return this.tokensService.canEnterMultiplayer(req.user.sub).then((allowed) => ({
      allowed,
      cost: MULTIPLAYER_ENTRY_COST,
    }));
  }
}
