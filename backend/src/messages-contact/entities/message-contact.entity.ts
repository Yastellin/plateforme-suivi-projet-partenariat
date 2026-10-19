import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { randomBytes, randomUUID } from 'crypto';
import { Etablissement } from '../../etablissements/entities/etablissement.entity';

// Référence lisible et unique d'un message (ex. MC-7K2QF9XM). Alphabet sans
// caractères ambigus (0/O, 1/I/L) pour pouvoir la dicter ou la recopier.
const ALPHABET_REFERENCE = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function genererReferenceMessage(): string {
  const octets = randomBytes(8);
  let suffixe = '';
  for (const octet of octets) {
    suffixe += ALPHABET_REFERENCE[octet % ALPHABET_REFERENCE.length];
  }
  return `MC-${suffixe}`;
}

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

  // Identifiant lisible communiqué à l'expéditeur et utilisé dans l'espace interne.
  @Column({ type: 'varchar', length: 20, unique: true })
  reference: string;

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
    if (!this.reference) {
      this.reference = genererReferenceMessage();
    }
    if (!this.date_creation) {
      this.date_creation = new Date();
    }
  }
}
