import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import type { ApiError } from '@appointment-saas/shared';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/:ok')
  health(@Param('ok') ok: string): { status: string } {
    if (ok !== 'ok') {
      const error: ApiError = {
        code: 'HEALTH_CHECK_FAILED',
        message: `Expected "ok", received "${ok}".`,
      };

      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }

    return { status: 'ok' };
  }
}
