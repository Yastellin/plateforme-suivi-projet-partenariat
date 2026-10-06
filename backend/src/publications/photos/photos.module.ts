import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { PhotoPublication } from '../enitities/photo-publication.entity';
import { Publication } from '../enitities/publication.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PhotoPublication, Publication])],
  controllers: [PhotosController],
  providers: [PhotosService],
  exports: [PhotosService],
})
export class PhotosModule {}