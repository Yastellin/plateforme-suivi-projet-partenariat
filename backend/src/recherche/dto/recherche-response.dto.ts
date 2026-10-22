import { ApiProperty } from '@nestjs/swagger';

export class ResultatRechercheDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'partenaire' })
  type: string;

  @ApiProperty({ example: 'Université de Toliara' })
  titre: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  url: string;
}

export class RechercheResponseDto {
  @ApiProperty()
  q: string;

  @ApiProperty({ type: [ResultatRechercheDto] })
  resultats: ResultatRechercheDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
