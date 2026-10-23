import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller.js';
import { AppointmentService } from './appointment.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ClientModule } from '../client/client.module.js';

@Module({
  imports: [PrismaModule, ClientModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
