import {
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DateFilter } from '../../events/dto/get-events.dto';

export class InsightsQueryDto {
  @ApiPropertyOptional({
    description: 'Date filter type',
    enum: DateFilter,
    example: DateFilter.DAY,
  })
  @IsOptional()
  @IsEnum(DateFilter)
  dateFilter?: DateFilter;

  @ApiPropertyOptional({
    description: 'Start date for custom range (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for custom range (ISO 8601)',
    example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Number of results to return',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
