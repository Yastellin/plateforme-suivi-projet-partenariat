import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreateCotutelleDto } from './create-cotutelle.dto';

export class UpdateCotutelleDto extends PartialType(
  OmitType(CreateCotutelleDto, ['date_debut'] as const),
) {
  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_debut?: string;
}
