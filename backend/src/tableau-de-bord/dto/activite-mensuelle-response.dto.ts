// src/tableau-de-bord/dto/activite-mensuelle-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ActiviteMensuellePointDto {
  @ApiProperty({ example: '2026-10', description: 'Mois au format AAAA-MM (UTC)' })
  mois: string;

  @ApiProperty({ example: 2 })
  conventions_signees: number;

  @ApiProperty({ example: 1 })
  projets_soumis: number;
}
