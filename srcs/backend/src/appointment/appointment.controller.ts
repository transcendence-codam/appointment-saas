import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  createAppoinmentSchema,
  createAppointmentResponseSchema,
  ErrorCode,
  type CreateAppointmentInput,
} from '@appointment-saas/shared';
import { AppointmentService } from './appointment.service.js';
import { apiErrorSchema, zodSchema } from '../common/swagger.js';

@ApiTags('appointment')
@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('public/:slug/bookings')
  @ApiOperation({ summary: 'Book an appointment as a client' })
  @ApiParam({ name: 'slug', description: 'Tenant slug', example: 'demo-salon' })
  @ApiBody({ schema: zodSchema(createAppoinmentSchema) })
  @ApiCreatedResponse({
    description: 'Appointment booked',
    schema: zodSchema(createAppointmentResponseSchema),
  })
  @ApiNotFoundResponse({
    description: 'Tenant or service not found',
    schema: apiErrorSchema(ErrorCode.TENANT_NOT_FOUND, ErrorCode.SERVICE_NOT_FOUND),
  })
  @ApiBadRequestResponse({
    description: 'Slot is not available',
    schema: apiErrorSchema(ErrorCode.STAFF_NOT_ASSIGNED, ErrorCode.SLOT_UNAVAILABLE),
  })
  @ApiConflictResponse({
    description: 'Slot was booked by someone else at the same time',
    schema: apiErrorSchema(ErrorCode.SLOT_TAKEN),
  })
  async create(@Param('slug') slug: string, @Body() body: CreateAppointmentInput) {
    return this.appointmentService.bookAppointment(slug, body);
  }
}
