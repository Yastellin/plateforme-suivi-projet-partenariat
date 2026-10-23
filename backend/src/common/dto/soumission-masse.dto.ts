import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SoumissionMasseDto {
  @ApiProperty({ type: [String], maxItems: 100 })
  @IsArray()
  @ArrayMinSize(1, { message: 'Sélectionnez au moins un élément à soumettre.' })
  @ArrayMaxSize(100, { message: 'Une soumission est limitée à 100 éléments.' })
  @ArrayUnique({ message: 'La sélection contient des éléments en double.' })
  @IsUUID('4', { each: true })
  ids: string[];
}
