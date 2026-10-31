import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsDefined,
  IsEnum,
  IsInt,
  Max,
  Min,
  Validate,
  ValidateIf,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {
  ChampDateExport,
  FormatExportAvance,
  ModePeriodeExport,
  PorteeExport,
  StatutFiltreExport,
} from '../export.enums';

@ValidatorConstraint({ name: 'dateAuApresDateDu', async: false })
class DateAuApresDateDu implements ValidatorConstraintInterface {
  validate(au: string | undefined, args: ValidationArguments): boolean {
    if (!au) return true;
    const periode = args.object as PeriodeExportDto;
    if (!periode.du) return true;
    return new Date(au).getTime() >= new Date(periode.du).getTime();
  }

  defaultMessage(): string {
    return 'La date « Au » doit être égale ou postérieure à la date « Du ».';
  }
}

export class PeriodeExportDto {
  @ApiProperty({ enum: ModePeriodeExport })
  @IsEnum(ModePeriodeExport)
  mode: ModePeriodeExport;

  @ApiPropertyOptional({ enum: ChampDateExport })
  @ValidateIf(
    (periode: PeriodeExportDto) => periode.mode !== ModePeriodeExport.TOUT,
  )
  @IsEnum(ChampDateExport)
  champ_date?: ChampDateExport;

  @ApiPropertyOptional({ minimum: 1900, maximum: 9999 })
  @ValidateIf(
    (periode: PeriodeExportDto) =>
      periode.mode === ModePeriodeExport.ANNEE ||
      periode.mode === ModePeriodeExport.MOIS,
  )
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(9999)
  annee?: number;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 11,
    description: 'Mois indexé de 0 à 11',
  })
  @ValidateIf(
    (periode: PeriodeExportDto) => periode.mode === ModePeriodeExport.MOIS,
  )
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(11)
  mois?: number;

  @ApiPropertyOptional({ format: 'date', example: '2026-06-01' })
  @ValidateIf(
    (periode: PeriodeExportDto) =>
      periode.mode === ModePeriodeExport.INTERVALLE,
  )
  @IsDateString()
  du?: string;

  @ApiPropertyOptional({ format: 'date', example: '2026-06-30' })
  @ValidateIf(
    (periode: PeriodeExportDto) =>
      periode.mode === ModePeriodeExport.INTERVALLE,
  )
  @IsDateString()
  @Validate(DateAuApresDateDu)
  au?: string;
}

export class FiltresExportDto {
  @ApiProperty({ enum: PorteeExport })
  @IsEnum(PorteeExport)
  portee: PorteeExport;

  @ApiProperty({ type: PeriodeExportDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => PeriodeExportDto)
  periode: PeriodeExportDto;

  @ApiProperty({ enum: StatutFiltreExport, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsEnum(StatutFiltreExport, { each: true })
  statuts: StatutFiltreExport[];

  @ApiProperty({ enum: FormatExportAvance })
  @IsEnum(FormatExportAvance)
  format: FormatExportAvance;
}
