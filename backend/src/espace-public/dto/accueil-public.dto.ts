import { ApiProperty } from '@nestjs/swagger';

export class StatistiquesPubliquesDto {
  @ApiProperty({ description: 'Nombre de partenaires actifs visibles publiquement' })
  partenaires_actifs: number;

  @ApiProperty({ description: 'Nombre de projets en cours (statut EN_COURS ou EN_ATTENTE)' })
  projets_en_cours: number;

  @ApiProperty({ description: 'Nombre de conventions signees ou actives' })
  conventions_signees: number;
}

export class PublicationRecenteDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  titre: string;

  @ApiProperty({ nullable: true })
  description_publique: string | null;

  @ApiProperty({ nullable: true })
  date_publication: Date | null;

  @ApiProperty({ nullable: true })
  projet_id: string;

  @ApiProperty({ nullable: true })
  photo_url: string | null;
}

export class AccueilPublicDto {
  @ApiProperty({ type: StatistiquesPubliquesDto })
  statistiques: StatistiquesPubliquesDto;

  @ApiProperty({ type: [PublicationRecenteDto] })
  publications_recentes: PublicationRecenteDto[];
}