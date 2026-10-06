import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConventionsController } from './conventions.controller';
import { ConventionsService } from './conventions.service';
import { Convention } from './entities/convention.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { Projet } from '../projets/entities/projet.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Convention,
      Partenariat,
      Projet,
      CotutelleThese,
    ]),
  ],
  controllers: [ConventionsController],
  providers: [ConventionsService],
  exports: [ConventionsService],
})
export class ConventionsModule {}