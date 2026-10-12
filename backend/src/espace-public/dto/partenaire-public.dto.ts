import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  site_web: string | null;
}
