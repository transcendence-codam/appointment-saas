import { PartialType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto.js';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
