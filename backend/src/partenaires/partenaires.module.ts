import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartenairesController } from './partenaires.controller';
import { PartenairesService } from './partenaires.service';
import { ContactsModule } from './contacts/contacts.module';
import { Partenaire } from './entities/partenaire.entity';
import { Contact } from './entities/contact.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partenaire, Contact]),
    ContactsModule,
  ],
  controllers: [PartenairesController],
  providers: [PartenairesService],
  exports: [PartenairesService, TypeOrmModule],
})
export class PartenairesModule {}