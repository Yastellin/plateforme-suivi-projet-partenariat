import { IsBoolean, IsEnum, IsOptional, IsUUID, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class UpdateAccesUtilisateurDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, valeur) => valeur !== null)
  @IsUUID()
  etablissement_id?: string | null;
}
