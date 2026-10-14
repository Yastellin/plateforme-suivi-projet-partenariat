import { ApiProperty } from '@nestjs/swagger';
import { TypeCotutelle } from '../../common/enums/type-cotutelle.enum';

export class EtablissementSimpleDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  nom: string;
  @ApiProperty({ nullable: true })
  sigle: string | null;
}

export class PartenaireSimpleDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  nom: string;
}

export class CotutelleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom_doctorant: string;

  @ApiProperty({ nullable: true })
  specialite: string | null;

  @ApiProperty({ nullable: true })
  directeur_these_local: string | null;

  @ApiProperty({ nullable: true })
  directeur_these_partenaire: string | null;

  @ApiProperty({ enum: TypeCotutelle })
  type: TypeCotutelle;

  @ApiProperty()
  date_debut: Date;

  @ApiProperty({ nullable: true })
  date_prevue_soutenance: Date | null;

  @ApiProperty({ nullable: true })
  financement_bourse: string | null;

  @ApiProperty({ nullable: true })
  mobilite_realisee: string | null;

  @ApiProperty({ nullable: true })
  publications_produites: string | null;

  @ApiProperty({ nullable: true })
  etat_avancement: string | null;

  @ApiProperty({ nullable: true })
  difficultes_rencontrees: string | null;

  @ApiProperty({ nullable: true })
  perspectives: string | null;

  @ApiProperty()
  archive: boolean;

  @ApiProperty()
  etablissement_id: string;

  @ApiProperty()
  partenaire_id: string;

  @ApiProperty({ nullable: true })
  convention_id: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
