import { Module } from '@nestjs/common';
import { CleanupController } from './cleanup.controller';
import { CleanupService } from './cleanup.service';
import { CleanupSchedulerService } from './cleanup-scheduler.service';

@Module({
  controllers: [CleanupController],
  providers: [CleanupService, CleanupSchedulerService],
  exports: [CleanupService],
})
export class CleanupModule {}