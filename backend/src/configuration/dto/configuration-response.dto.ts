// backend/src/configuration/dto/configuration-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConfigurationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cle: string;

  @ApiPropertyOptional({ nullable: true })
  valeur: string | null;

  @ApiPropertyOptional({ nullable: true })
  logo_url: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
