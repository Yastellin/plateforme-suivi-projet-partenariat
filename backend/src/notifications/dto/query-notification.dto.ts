import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { TypeNotification, PrioriteNotification } from '@prisma/client';

export class QueryNotificationDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TypeNotification })
  @IsOptional()
  @IsEnum(TypeNotification)
  type?: TypeNotification;

  @ApiPropertyOptional({ enum: PrioriteNotification })
  @IsOptional()
  @IsEnum(PrioriteNotification)
  priorite?: PrioriteNotification;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  est_lue?: boolean;
}