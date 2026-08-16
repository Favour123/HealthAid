import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { IncidentCategory } from '../incident-category';

export class CreateIncidentDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(3)
  description: string;

  @IsEnum(IncidentCategory)
  category: IncidentCategory;

  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  address?: string;
}
