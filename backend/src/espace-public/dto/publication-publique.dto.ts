import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ type: [PhotoPubliqueDto] })
  photos: PhotoPubliqueDto[];
}
