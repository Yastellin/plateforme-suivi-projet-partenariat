import { ApiProperty } from '@nestjs/swagger';

// Partenaire visible publiquement (visibilite = PUBLIC, statut = ACTIF).
export class PartenairePublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  pays: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ nullable: true })
  logo_url: string | null;

  @ApiProperty({ nullable: true })
  site_web: string | null;

  @ApiProperty({ description: 'Partenaire stratégique de l’Université' })
  est_strategique: boolean;
}
