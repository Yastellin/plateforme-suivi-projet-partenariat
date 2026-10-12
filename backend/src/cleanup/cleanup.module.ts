import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../documents/entities/document.entity';
import { PhotoPublication } from '../publications/enitities/photo-publication.entity';
import { CleanupController } from './cleanup.controller';
import { CleanupService } from './cleanup.service';
import { CleanupSchedulerService } from './cleanup-scheduler.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document, PhotoPublication])],
  controllers: [CleanupController],
  providers: [CleanupService, CleanupSchedulerService],
  exports: [CleanupService],
})
export class CleanupModule {}
