import { ApiProperty } from '@nestjs/swagger';

export class StatistiquesEtablissementDto {
  @ApiProperty()
  etablissement_id: string;

  @ApiProperty()
  etablissement_nom: string;

  @ApiProperty({ nullable: true })
  etablissement_logo_url: string | null;

  @ApiProperty({ nullable: true })
  etablissement_sigle: string | null;

  @ApiProperty()
  partenaires: number;

  @ApiProperty()
  partenariats: number;

  @ApiProperty()
  projets: number;

  @ApiProperty()
  projets_actifs: number;

  @ApiProperty()
  cotutelles: number;
}

export class ComparatifEtablissementsResponseDto {
  @ApiProperty({ type: [StatistiquesEtablissementDto] })
  etablissements: StatistiquesEtablissementDto[];
}
