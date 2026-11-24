import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator';

const trimToNull = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;

export class CreateStaffDto {
  @ApiProperty({ example: 'John Doe', maxLength: 100 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  displayName!: string;

  @ApiPropertyOptional({ example: 'Senior stylist', maxLength: 100, nullable: true })
  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @MaxLength(100)
  jobTitle?: string | null;

  @ApiPropertyOptional({ example: 'I like dogs', maxLength: 1000, nullable: true })
  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @MaxLength(1000)
  bio?: string | null;

  @ApiPropertyOptional({ example: 'http://example.com.jpg', nullable: true })
  @IsOptional()
  @Transform(trimToNull)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  photoUrl?: string | null;

  @ApiPropertyOptional({ example: 0, description: 'Defaults to the end of the list' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
