import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OccurrenceCategory, OccurrenceStatus } from '../interfaces/occurrence.interface';

export class FilterOccurrenceDto {
  @IsOptional()
  @IsEnum(OccurrenceCategory)
  category?: OccurrenceCategory;

  @IsOptional()
  @IsEnum(OccurrenceStatus)
  status?: OccurrenceStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  requesterName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

