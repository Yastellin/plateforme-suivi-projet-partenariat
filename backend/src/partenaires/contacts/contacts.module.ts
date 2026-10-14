import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ContactsController,
  ContactsDirectController,
} from './contacts.controller';
import { ContactsService } from './contacts.service';
import { Contact } from '../entities/contact.entity';
import { Partenaire } from '../entities/partenaire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact, Partenaire])],
  controllers: [ContactsController, ContactsDirectController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
