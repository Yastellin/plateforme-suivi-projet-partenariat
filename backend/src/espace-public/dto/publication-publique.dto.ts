import { ApiProperty } from '@nestjs/swagger';
import { EtablissementRefPublicDto } from './projet-public.dto';

export class PhotoPubliqueDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url_fichier: string;

  @ApiProperty({ nullable: true })
  legende: string | null;

  @ApiProperty()
  ordre: number;
}

export class ProjetRefPubliqueDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiProperty({ nullable: true })
  intitule_officiel: string | null;

  @ApiProperty({ type: EtablissementRefPublicDto, nullable: true })
  etablissement: EtablissementRefPublicDto | null;
}

// Publication publiée par la Présidence (statut = PUBLIEE, projet non archivé).
export class PublicationPubliqueDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  titre: string;

  @ApiProperty({ nullable: true })
  description_publique: string | null;

  @ApiProperty({ nullable: true })
  date_publication: Date | null;

  @ApiProperty({ nullable: true })
  resultats: string | null;

  @ApiProperty()
  projet_id: string;

  @ApiProperty({ type: ProjetRefPubliqueDto })
  projet: ProjetRefPubliqueDto;

  @ApiProperty({ nullable: true })
  photo_url: string | null;

  @ApiProperty({ type: [PhotoPubliqueDto] })
  photos: PhotoPubliqueDto[];
}
