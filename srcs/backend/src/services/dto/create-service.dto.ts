// This file is for checking incoming data: name cannot be empty, duration of slot, price must be a whole number of cents

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDivisibleBy, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min} from 'class-validator';
import { SLOT_STEP_MIN, MAX_DURATION_MIN, MAX_PRICE_CENTS } from '../services.constants.js';

export class CreateServiceDto {
    @ApiProperty({ example: 'Haircut', maxLength: 100}) 
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string

    @ApiProperty({ example: 30, description: `Minutes. Must be a multiple of ${SLOT_STEP_MIN}.` })
    @IsInt()
    @Min(SLOT_STEP_MIN)
    @Max(MAX_DURATION_MIN)
    @IsDivisibleBy(SLOT_STEP_MIN)
    durationMin!: number;

    @ApiProperty({ example: 3500, description: 'Price is in integer cents (3500 = 35.00)' })
    @IsInt()
    @Min(0)
    @Max(MAX_PRICE_CENTS)
    priceCents!: number;

    @ApiPropertyOptional({ example: 0, description: 'Defaults to the end of the list' })
    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}