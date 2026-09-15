import { ApiProperty } from '@nestjs/swagger';

export class EtablissementResponseDto {
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

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}