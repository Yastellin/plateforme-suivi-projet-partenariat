import { ApiProperty } from '@nestjs/swagger';

export class CompteursSyntheseDto {
  @ApiProperty()
  partenaires: number;

  @ApiProperty()
  conventions_actives: number;

  @ApiProperty()
  conventions_expirees: number;

  @ApiProperty()
  cotutelles: number;

  @ApiProperty()
  projets_actifs: number;
}

export class SyntheseItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  etablissement_id: string;

  @ApiProperty()
  annee: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  valeur: string;
}

export class PartenaireStrategiqueResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  partenaire_id: string;

  @ApiProperty()
  partenaire_nom: string;
}

export class SyntheseEtablissementDto {
  @ApiProperty()
  etablissement_id: string;

  @ApiProperty()
  etablissement_nom: string;

  @ApiProperty()
  annee: number;

  @ApiProperty({ type: CompteursSyntheseDto })
  compteurs: CompteursSyntheseDto;

  @ApiProperty({ type: [SyntheseItemResponseDto] })
  items: SyntheseItemResponseDto[];

  @ApiProperty({ type: [PartenaireStrategiqueResponseDto] })
  partenaires_strategiques: PartenaireStrategiqueResponseDto[];
}

export class SyntheseGlobaleDto {
  @ApiProperty()
  annee: number;

  @ApiProperty({ type: [SyntheseEtablissementDto] })
  etablissements: SyntheseEtablissementDto[];
}