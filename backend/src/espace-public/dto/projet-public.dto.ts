import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjetPublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiPropertyOptional({ nullable: true })
  intitule_officiel: string | null;

  @ApiProperty()
  type: string;

  @ApiPropertyOptional({ nullable: true })
  domaine: string | null;

  @ApiProperty()
  date_debut: Date;

  @ApiProperty()
  date_fin_prevue: Date;

  @ApiPropertyOptional({ nullable: true })
  etablissement_nom: string | null;

  @ApiPropertyOptional({ nullable: true })
  etablissement_sigle: string | null;
}
