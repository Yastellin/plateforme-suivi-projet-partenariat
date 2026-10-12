import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreatePartenariatDto } from './create-partenariat.dto';

// La date de debut est redeclaree sans la regle d'ajout (« aujourd'hui ou
// posterieure ») : une modification reste possible sur une date passee.
export class UpdatePartenariatDto extends PartialType(
  OmitType(CreatePartenariatDto, ['date_debut'] as const),
) {
  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_debut?: string;
}
