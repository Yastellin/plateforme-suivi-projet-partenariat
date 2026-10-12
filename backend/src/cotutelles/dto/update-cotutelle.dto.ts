import { PartialType } from '@nestjs/swagger';
import { CreateCotutelleDto } from './create-cotutelle.dto';

export class UpdateCotutelleDto extends PartialType(CreateCotutelleDto) {}
