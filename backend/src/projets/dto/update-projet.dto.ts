import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreateProjetDto } from './create-projet.dto';

export class UpdateProjetDto extends PartialType(
  OmitType(CreateProjetDto, ['date_debut'] as const),
) {
  @ApiPropertyOptional({ example: '2025-01-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_debut?: string;
}
