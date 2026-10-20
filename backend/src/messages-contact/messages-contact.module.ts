import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Utilisateur } from '../auth/entities/utilisateur.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { MessageContact } from './entities/message-contact.entity';
import { MessagesContactService } from './messages-contact.service';
import { MessageContactRecuListener } from './listeners/message-contact-recu.listener';
import {
  ContactPublicController,
  MessagesContactController,
} from './messages-contact.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageContact, Etablissement, Utilisateur]),
    NotificationsModule,
  ],
  controllers: [ContactPublicController, MessagesContactController],
  providers: [MessagesContactService, MessageContactRecuListener],
})
export class MessagesContactModule {}
