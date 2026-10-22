import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatutConvention } from '../../common/enums/statut-convention.enum';

export class ConventionLienDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  libelle: string;

  @ApiPropertyOptional({ nullable: true })
  complement: string | null;
}

export class ConventionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  titre: string;

  @ApiProperty({ nullable: true })
  date_signature: Date | null;

  @ApiProperty({ nullable: true })
  date_debut: Date | null;

  @ApiProperty({ nullable: true })
  date_fin: Date | null;

  @ApiProperty({ enum: StatutConvention })
  statut: StatutConvention;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  archive: boolean;

  @ApiProperty({ nullable: true })
  partenariat_id: string | null;

  @ApiProperty({ nullable: true })
  projet_id: string | null;

  @ApiPropertyOptional({ nullable: true })
  partenariat: ConventionLienDto | null;

  @ApiPropertyOptional({ nullable: true })
  projet: ConventionLienDto | null;

  @ApiPropertyOptional({ nullable: true })
  cotutelle_id: string | null;

  @ApiPropertyOptional({ nullable: true })
  cotutelle: ConventionLienDto | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
