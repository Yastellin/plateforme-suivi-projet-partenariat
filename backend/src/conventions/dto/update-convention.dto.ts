import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreateConventionDto } from './create-convention.dto';

// La date de debut est redeclaree sans la regle d'ajout (« aujourd'hui ou
// posterieure ») : une modification reste possible sur une date passee.
export class UpdateConventionDto extends PartialType(
  OmitType(CreateConventionDto, ['date_debut'] as const),
) {
  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_debut?: string;
}
