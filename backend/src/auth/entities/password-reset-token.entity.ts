import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { randomUUID } from 'node:crypto';
import type { Utilisateur } from './utilisateur.entity';

@Entity('password_reset_tokens')
@Index('idx_prt_token_hash', ['token_hash'], { unique: true })
@Index('idx_prt_utilisateur', ['utilisateur_id'])
export class PasswordResetToken {
  @PrimaryColumn('text')
  id: string;

  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  token_hash: string;

  @Column({ name: 'utilisateur_id', type: 'uuid' })
  utilisateur_id: string;

  @ManyToOne('Utilisateur', { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'utilisateur_id',
    foreignKeyConstraintName: 'fk_prt_utilisateur',
  })
  utilisateur: Utilisateur;

  @Column({ name: 'expire_le', type: 'timestamptz' })
  expire_le: Date;

  @Column({ name: 'utilise_le', type: 'timestamptz', nullable: true })
  utilise_le: Date | null;

  @CreateDateColumn({ name: 'cree_le', type: 'timestamptz' })
  cree_le: Date;

  @BeforeInsert()
  genererId(): void {
    if (!this.id) this.id = randomUUID();
  }
}
