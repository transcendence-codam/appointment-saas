import { ApiProperty } from "@nestjs/swagger";
import { LargeNumberLike } from "crypto";

export class ServiceResponseDto {
    @ApiProperty({ format : 'uuid' }) id!: string;
    @ApiProperty() name!: string; 
    @ApiProperty() durationMin!: number;
    @ApiProperty({ description: 'Integer cents' }) priceCents!: number;
    @ApiProperty() sortOrder!: number;
    @ApiProperty() isActive!: boolean;
    @ApiProperty() createdAt!: Date;
}