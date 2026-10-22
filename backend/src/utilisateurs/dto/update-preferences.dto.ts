import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ThemeCompte {
  CLAIR = 'CLAIR',
  SOMBRE = 'SOMBRE',
  SYSTEME = 'SYSTEME',
}

export enum DensiteInterface {
  CONFORTABLE = 'CONFORTABLE',
  COMPACTE = 'COMPACTE',
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: ThemeCompte })
  @IsOptional()
  @IsEnum(ThemeCompte)
  theme?: ThemeCompte;

  @ApiPropertyOptional({ enum: DensiteInterface })
  @IsOptional()
  @IsEnum(DensiteInterface)
  densite?: DensiteInterface;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  animations?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aide_contextuelle?: boolean;
}
