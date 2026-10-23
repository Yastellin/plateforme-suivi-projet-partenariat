import { Module } from '@nestjs/common';
import { HistoriqueModule } from '../historique/historique.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartenairesController } from './partenaires.controller';
import { PartenairesService } from './partenaires.service';
import { ContactsModule } from './contacts/contacts.module';
import { Partenaire } from './entities/partenaire.entity';
import { Contact } from './entities/contact.entity';
import { CoordonneesModule } from '../coordonnees/coordonnees.module';

@Module({
  imports: [
    HistoriqueModule,
    TypeOrmModule.forFeature([Partenaire, Contact]),
    CoordonneesModule,
    ContactsModule,
  ],
  controllers: [PartenairesController],
  providers: [PartenairesService],
  exports: [PartenairesService, TypeOrmModule],
})
export class PartenairesModule {}
