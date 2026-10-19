import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { MessageContact } from './entities/message-contact.entity';
import { MessagesContactService } from './messages-contact.service';
import {
  ContactPublicController,
  MessagesContactController,
} from './messages-contact.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MessageContact, Etablissement])],
  controllers: [ContactPublicController, MessagesContactController],
  providers: [MessagesContactService],
})
export class MessagesContactModule {}
