import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({ nullable: true })
  etablissements: { id: string; nom: string; sigle: string | null }[];
}
