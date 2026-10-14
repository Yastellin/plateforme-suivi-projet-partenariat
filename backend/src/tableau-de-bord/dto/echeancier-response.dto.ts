import { ApiProperty } from '@nestjs/swagger';

export class EcheanceConventionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  titre: string;

  @ApiProperty()
  date_fin: Date;

  @ApiProperty()
  jours_restants: number;
}

export class ProjetEnRetardDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiProperty()
  date_fin_prevue: Date;

  @ApiProperty()
  jours_de_retard: number;
}

export class EcheancierResponseDto {
  @ApiProperty({ type: [EcheanceConventionDto] })
  conventions_bientot_expirees: EcheanceConventionDto[];

  @ApiProperty({ type: [ProjetEnRetardDto] })
  projets_en_retard: ProjetEnRetardDto[];
}
