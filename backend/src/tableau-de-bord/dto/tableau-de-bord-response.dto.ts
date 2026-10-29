// src/tableau-de-bord/dto/tableau-de-bord-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class RepartitionConventionsDto {
  @ApiProperty()
  BROUILLON: number;

  @ApiProperty()
  EN_ATTENTE_SIGNATURE: number;

  @ApiProperty()
  SIGNEE: number;

  @ApiProperty()
  ACTIVE: number;

  @ApiProperty()
  SUSPENDUE: number;

  @ApiProperty()
  EXPIREE: number;
}

export class CompteursGlobauxDto {
  @ApiProperty()
  partenaires: number;

  @ApiProperty()
  partenaires_actifs: number;

  @ApiProperty()
  partenariats: number;

  @ApiProperty()
  cotutelles: number;

  @ApiProperty()
  projets: number;

  @ApiProperty()
  projets_en_cours: number;

  @ApiProperty()
  conventions: number;

  @ApiProperty()
  conventions_signees: number;

  @ApiProperty()
  conventions_actives: number;

  @ApiProperty()
  conventions_a_echeance: number;

  @ApiProperty()
  publications: number;

  @ApiProperty({ type: RepartitionConventionsDto })
  repartition_conventions: RepartitionConventionsDto;
}

export class ProjetsParStatutDto {
  @ApiProperty()
  BROUILLON: number;

  @ApiProperty()
  EN_ATTENTE: number;

  @ApiProperty()
  EN_COURS: number;

  @ApiProperty()
  SUSPENDU: number;

  @ApiProperty()
  EXPIRE: number;

  @ApiProperty()
  TERMINE: number;
}

export class ConventionsParStatutDto {
  @ApiProperty()
  actives: number;

  @ApiProperty()
  expirees: number;

  @ApiProperty()
  bientot_expirees: number;

  @ApiProperty()
  en_attente_signature: number;
}

export class TableauDeBordResponseDto {
  @ApiProperty({ type: CompteursGlobauxDto })
  compteurs: CompteursGlobauxDto;

  @ApiProperty({ type: ProjetsParStatutDto })
  projets_par_statut: ProjetsParStatutDto;

  @ApiProperty({ type: ConventionsParStatutDto })
  conventions_par_statut: ConventionsParStatutDto;

  @ApiProperty({ example: 'GLOBAL' })
  perimetre: 'GLOBAL' | 'ETABLISSEMENT';
}
