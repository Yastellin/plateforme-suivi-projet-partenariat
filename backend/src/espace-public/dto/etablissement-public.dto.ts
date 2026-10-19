import { ApiProperty } from '@nestjs/swagger';

// Établissement membre de l'Université (fiche publique).
export class EtablissementPublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiProperty({ nullable: true })
  sigle: string | null;

  @ApiProperty({ nullable: true })
  logo_url: string | null;

  @ApiProperty({ nullable: true })
  description: string | null;
}
