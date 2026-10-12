import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreateCotutelleDto } from './create-cotutelle.dto';

// La date de debut est redeclaree sans la regle d'ajout (« aujourd'hui ou
// posterieure ») : une modification reste possible sur une date passee.
export class UpdateCotutelleDto extends PartialType(
  OmitType(CreateCotutelleDto, ['date_debut'] as const),
) {
  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_debut?: string;
}
