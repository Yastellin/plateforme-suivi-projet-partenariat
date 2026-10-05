import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';

@Entity('Etablissement')
@Index(['nom'])
export class Etablissement {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ type: 'varchar', nullable: true })
  sigle: string | null;

  @Column({ type: 'varchar', nullable: true })
  logo_url: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

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