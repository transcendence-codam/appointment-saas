import { PartialType } from '@nestjs/swagger';
import { CreateStaffDto } from './create-staff.dto.js';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}
