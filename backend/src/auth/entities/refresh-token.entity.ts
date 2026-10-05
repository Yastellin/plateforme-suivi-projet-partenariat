import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Utilisateur } from './utilisateur.entity';

@Entity('RefreshToken')
@Index(['utilisateur_id'])
@Index(['expires_at'])
@Index(['revoked_at'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token_hash: string;

  @Column()
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
}