import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppointmentModule } from './appointment/appointment.module.js';
import { ConfigModule } from '@nestjs/config';
import { ServicesModule } from './services/services.module.js';

@Module({
  imports: [AppointmentModule, ConfigModule.forRoot({ isGlobal: true }), ServicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
