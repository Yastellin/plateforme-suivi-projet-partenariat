import { Global, Module } from '@nestjs/common';
import { STORAGE_PORT } from './storage.port';
import { LocalStorageAdapter } from './local-storage.adapter';

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_PORT,
      useClass: LocalStorageAdapter,
    },
  ],
  exports: [STORAGE_PORT],
})
export class StorageModule {}