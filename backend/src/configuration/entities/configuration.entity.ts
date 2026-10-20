// backend/src/configuration/entities/configuration.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { randomUUID } from 'crypto';

@Entity('Configuration')
export class Configuration {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  cle: string;

  @Column({ type: 'text', nullable: true })
  valeur: string | null;

  @Column({ type: 'varchar', nullable: true })
  logo_url: string | null;

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 3 })
  updated_at: Date;

  @BeforeInsert()
  preparerInsertion() {
    const maintenant = new Date();
    if (!this.id) this.id = randomUUID();
    if (!this.created_at) this.created_at = maintenant;
    if (!this.updated_at) this.updated_at = maintenant;
  }

  @BeforeUpdate()
  preparerMiseAJour() {
    this.updated_at = new Date();
  }
}
