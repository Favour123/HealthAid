import { IsEnum, IsOptional } from 'class-validator';
import { IncidentCategory } from '../incident-category';

export class QueryIncidentsDto {
  @IsOptional()
  @IsEnum(IncidentCategory)
  category?: IncidentCategory;
}
