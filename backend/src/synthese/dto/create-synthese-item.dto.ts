import { IsString, IsInt, IsUUID, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSyntheseItemDto {
  @ApiProperty({ description: 'ID de l etablissement' })
  @IsUUID()
  etablissement_id: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2000)
  annee: number;

  @ApiProperty({
    description: 'Type d item (DOMAINE_PRINCIPAL, DEFI_MAJEUR, PRIORITE_FUTURE)',
    example: 'DOMAINE_PRINCIPAL',
  })
  @IsString()
  @MinLength(2)
  type: string;

  @ApiProperty({ example: 'Recherche en biologie marine' })
  @IsString()
  @MinLength(3)
  valeur: string;
}