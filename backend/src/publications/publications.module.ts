import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { PhotosModule } from './photos/photos.module';
import { Publication } from './enitities/publication.entity';
import { Projet } from '../projets/entities/projet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Publication, Projet]), PhotosModule],
  controllers: [PublicationsController],
  providers: [PublicationsService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
