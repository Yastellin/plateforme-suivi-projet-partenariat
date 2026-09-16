import { ApiProperty } from '@nestjs/swagger';

export class PhotoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  publication_id: string;

  @ApiProperty()
  url_fichier: string;

  @ApiProperty({ nullable: true })
  legende: string | null;

  @ApiProperty()
  ordre: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}