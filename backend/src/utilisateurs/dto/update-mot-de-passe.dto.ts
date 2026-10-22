import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMotDePasseDto {
  @ApiProperty()
  @IsString()
  mot_de_passe_actuel: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  nouveau_mot_de_passe: string;
}
