import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreateConventionDto } from './create-convention.dto';

export class UpdateConventionDto extends PartialType(
  OmitType(CreateConventionDto, ['date_debut'] as const),
) {
  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_debut?: string;
}
