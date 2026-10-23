import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EtablissementPartenariatPublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiPropertyOptional({ nullable: true })
  sigle: string | null;

  @ApiPropertyOptional({ nullable: true })
  logo_url: string | null;
}

export class PartenairePartenariatPublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiPropertyOptional({ nullable: true })
  logo_url: string | null;
}

export class PartenariatPublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  intitule: string;

  @ApiPropertyOptional({ nullable: true })
  objet: string | null;

  @ApiProperty()
  domaine: string;

  @ApiProperty()
  date_debut: Date;

  @ApiPropertyOptional({ nullable: true })
  date_fin: Date | null;

  @ApiProperty({ type: [EtablissementPartenariatPublicDto] })
  etablissements: EtablissementPartenariatPublicDto[];

  @ApiProperty({ type: [PartenairePartenariatPublicDto] })
  partenaires: PartenairePartenariatPublicDto[];
}
