import { IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSynthesePartenaireStrategiqueDto {
  @ApiProperty()
  @IsUUID()
  etablissement_id: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  annee: number;

  @ApiProperty()
  @IsUUID()
  partenaire_id: string;
}