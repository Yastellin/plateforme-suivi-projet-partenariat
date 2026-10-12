import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePorteurDto {
  @ApiProperty({ example: 'Dr. Rakoto Jean' })
  @IsString()
  @MinLength(2)
  nom: string;

  @ApiPropertyOptional({ example: 'FDS' })
  @IsOptional()
  @IsString()
  institution_rattachement?: string;
}
