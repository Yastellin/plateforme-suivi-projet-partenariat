import { ApiProperty } from '@nestjs/swagger';
import { TypeDocument } from '../../common/enums/type-document.enum';

export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom_fichier: string;

  @ApiProperty()
  url_fichier: string;

  @ApiProperty({ enum: TypeDocument })
  type: TypeDocument;

  @ApiProperty()
  version: number;

  @ApiProperty()
  est_archive: boolean;

  @ApiProperty({ nullable: true })
  projet_id: string | null;

  @ApiProperty({ nullable: true })
  convention_id: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}