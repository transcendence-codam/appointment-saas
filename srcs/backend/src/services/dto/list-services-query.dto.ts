import { ApiIncludeEndpoint, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class ListServicesQueryDto {
    @ApiPropertyOptional({ default: false, description: 'Also return archived services' })
    @IsOptional()
    @Transform(({ value }) => value === true || value === 'true')
    @IsBoolean()
    includeArchived?: boolean;
}