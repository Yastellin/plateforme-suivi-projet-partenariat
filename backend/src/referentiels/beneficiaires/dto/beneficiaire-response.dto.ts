import { ApiProperty } from '@nestjs/swagger';

export class BeneficiaireResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nom: string;

  @ApiProperty({ nullable: true })
  categorie: string | null;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
