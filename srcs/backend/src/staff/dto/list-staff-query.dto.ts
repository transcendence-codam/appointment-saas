import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class ListStaffQueryDto {
    @ApiPropertyOptional({ default: false, description: 'Also returned archived staff'})
    @IsOptional()
    @Transform(({ value }) => value === true || value === 'true')
    @IsBoolean()
    includeArchived?: boolean;
}