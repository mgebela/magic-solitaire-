import { Controller, Get } from '@nestjs/common';
import { LAYOUT_VERSION } from '@three-towers/shared';

@Controller()
export class AppController {
  @Get()
  getInfo() {
    return {
      name: 'Three Towers Solitaire API',
      version: '0.1.0',
      milestone: 3,
      layoutVersion: LAYOUT_VERSION,
    };
  }
}
