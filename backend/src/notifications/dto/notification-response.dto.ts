import { ApiProperty } from '@nestjs/swagger';
import { TypeNotification } from '../../common/enums/type-notification.enum';
import { PrioriteNotification } from '../../common/enums/priorite-notification.enum';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  titre: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: TypeNotification })
  type: TypeNotification;

  @ApiProperty({ enum: PrioriteNotification })
  priorite: PrioriteNotification;

  @ApiProperty()
  date_creation: Date;

  @ApiProperty()
  est_lue: boolean;

  @ApiProperty()
  utilisateur_id: string;

  @ApiProperty()
  reference_type: string;

  @ApiProperty()
  reference_id: string;
}