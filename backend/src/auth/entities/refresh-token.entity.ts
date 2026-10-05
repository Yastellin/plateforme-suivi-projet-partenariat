import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Utilisateur } from './utilisateur.entity';

@Entity('RefreshToken')
@Index(['utilisateur_id'])
@Index(['expires_at'])
@Index(['revoked_at'])
export class RefreshToken {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  token_hash: string;

  @Column({ type: 'uuid' })
  utilisateur_id: string;

  @Column({ type: 'timestamp', precision: 3 })
  expires_at: Date;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  revoked_at: Date | null;

  @ManyToOne(() => Utilisateur, (user) => user.refresh_tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @BeforeInsert()
  genererId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}