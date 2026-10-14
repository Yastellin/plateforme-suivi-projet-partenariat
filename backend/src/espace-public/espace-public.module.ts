import { Module } from '@nestjs/common';
import { EspacePublicController } from './espace-public.controller';
import { EspacePublicService } from './espace-public.service';

@Module({
  controllers: [EspacePublicController],
  providers: [EspacePublicService],
  exports: [EspacePublicService],
})
export class EspacePublicModule {}

