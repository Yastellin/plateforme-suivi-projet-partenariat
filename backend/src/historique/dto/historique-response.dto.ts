// backend/src/historique/dto/historique-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActionHistorique } from '../../common/enums/action-historique.enum';

export class HistoriqueActionResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  utilisateur_id: string | null;

  @ApiPropertyOptional({ nullable: true })
  utilisateur_nom: string | null;

  @ApiPropertyOptional({ nullable: true })
  utilisateur_role: string | null;

  @ApiProperty({ enum: ActionHistorique })
  action: ActionHistorique;

  @ApiProperty()
  entite_type: string;

  @ApiPropertyOptional({ nullable: true })
  entite_id: string | null;

  @ApiPropertyOptional({ nullable: true })
  entite_nom: string | null;

  @ApiPropertyOptional({ nullable: true })
  details: string | null;

  @ApiProperty()
  date_creation: Date;
}
