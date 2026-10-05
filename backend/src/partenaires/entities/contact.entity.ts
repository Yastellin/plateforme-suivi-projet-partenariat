import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Partenaire } from './partenaire.entity';

@Entity('Contact')
@Index(['partenaire_id'])
export class Contact {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nom: string;

  @Column({ type: 'varchar', nullable: true })
  fonction: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  telephone: string | null;

  @Column({ type: 'uuid' })
  partenaire_id: string;

  @ManyToOne(() => Partenaire, (partenaire) => partenaire.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 3 })
  updated_at: Date;

  @BeforeInsert()
  genererId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}