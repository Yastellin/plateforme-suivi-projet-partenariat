import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreatePartenariatDto } from './create-partenariat.dto';

export class UpdatePartenariatDto extends PartialType(
  OmitType(CreatePartenariatDto, ['date_debut'] as const),
) {
  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  date_debut?: string;
}
