import { Module } from '@nestjs/common';
import { PartenairesController } from './partenaires.controller';
import { PartenairesService } from './partenaires.service';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [ContactsModule],
  controllers: [PartenairesController],
  providers: [PartenairesService],
  exports: [PartenairesService],
})
export class PartenairesModule {}