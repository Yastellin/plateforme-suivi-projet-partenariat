import { PartialType } from '@nestjs/swagger';
import { CreatePorteurDto } from './create-porteur.dto';

export class UpdatePorteurDto extends PartialType(CreatePorteurDto) {}
