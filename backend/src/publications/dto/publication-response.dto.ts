import { ApiProperty } from '@nestjs/swagger';
import { StatutPublication } from '../../common/enums/statut-publication.enum';

export class PhotoPublicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url_fichier: string;

  @ApiProperty({ nullable: true })
  legende: string | null;

  @ApiProperty()
  ordre: number;
}

export class PublicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  titre: string;

  @ApiProperty({ nullable: true })
  description_publique: string | null;

  @ApiProperty({ nullable: true })
  date_publication: Date | null;

  @ApiProperty({ enum: StatutPublication })
  statut: StatutPublication;

  @ApiProperty({ nullable: true })
  resultats: string | null;

  @ApiProperty()
  projet_id: string;

  @ApiProperty({ type: [PhotoPublicationResponseDto] })
  photos: PhotoPublicationResponseDto[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}