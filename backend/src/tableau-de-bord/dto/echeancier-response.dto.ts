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

  @ApiProperty({ nullable: true })
  etablissement_nom: string | null;

  @ApiProperty({ nullable: true })
  etablissement_logo_url: string | null;
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

  @ApiProperty({ nullable: true })
  etablissement_nom: string | null;

  @ApiProperty({ nullable: true })
  etablissement_logo_url: string | null;
}

export class EcheancierResponseDto {
  @ApiProperty({ type: [EcheanceConventionDto] })
  conventions_bientot_expirees: EcheanceConventionDto[];

  @ApiProperty({ type: [ProjetEnRetardDto] })
  projets_en_retard: ProjetEnRetardDto[];
}
