import { Module } from '@nestjs/common';
import { ClientService } from './client.service.js';

@Module({
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}
