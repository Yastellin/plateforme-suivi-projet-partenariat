import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { randomUUID } from 'node:crypto';
import { TypeCoordonnee } from '../../common/enums/type-coordonnee.enum';
import { Partenaire } from '../../partenaires/entities/partenaire.entity';
import { Contact } from '../../partenaires/entities/contact.entity';

@Entity('Coordonnee')
@Unique(['type', 'valeur_normalisee'])
@Index(['partenaire_id'])
@Index(['contact_id'])
export class Coordonnee {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TypeCoordonnee, enumName: 'TypeCoordonnee' })
  type: TypeCoordonnee;

  @Column({ type: 'varchar' })
  valeur: string;

  @Column({ type: 'varchar' })
  valeur_normalisee: string;

  @Column({ type: 'text', nullable: true })
  partenaire_id: string | null;

  @Column({ type: 'text', nullable: true })
  contact_id: string | null;

  @ManyToOne(() => Partenaire, (partenaire) => partenaire.coordonnees, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire | null;

  @ManyToOne(() => Contact, (contact) => contact.coordonnees, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contact_id' })
  contact: Contact | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @BeforeInsert()
  preparerInsertion() {
    if (!this.id) this.id = randomUUID();
  }
}
