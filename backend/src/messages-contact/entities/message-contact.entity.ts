import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Etablissement } from '../../etablissements/entities/etablissement.entity';

// Message envoye depuis le formulaire de contact public.
// etablissement_id = null : destine a la Presidence (vue par tous les
// administrateurs). Renseigne : destine a l'etablissement (vue par ses
// utilisateurs et par la Presidence).
@Entity('MessageContact')
@Index(['etablissement_id'])
@Index(['est_lu'])
@Index(['date_creation'])
export class MessageContact {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nom: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone: string | null;

  @Column({ type: 'varchar', length: 200 })
  sujet: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'uuid', nullable: true })
  etablissement_id: string | null;

  @ManyToOne(() => Etablissement, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'etablissement_id' })
  etablissement: Etablissement | null;

  @Column({ default: false })
  est_lu: boolean;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  date_lecture: Date | null;

  @Column({ type: 'timestamp', precision: 3 })
  date_creation: Date;

  @BeforeInsert()
  preparerInsertion() {
    if (!this.id) {
      this.id = randomUUID();
    }
    if (!this.date_creation) {
      this.date_creation = new Date();
    }
  }
}
