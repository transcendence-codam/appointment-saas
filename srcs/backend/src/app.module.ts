import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppointmentModule } from './appointment/appointment.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AppointmentModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
