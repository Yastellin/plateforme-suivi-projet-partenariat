import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { Etablissement } from '../../etablissements/entities/etablissement.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('Utilisateur')
@Index(['etablissement_id'])
@Index(['role'])
@Index(['actif'])
export class Utilisateur {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ type: 'enum', enum: Role, enumName: 'Role' })
  role: Role;

  @Column({ nullable: true })
  etablissement_id: string | null;

  @Column({ default: true })
  actif: boolean;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  derniere_connexion: Date | null;

  @ManyToOne(() => Etablissement, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'etablissement_id' })
  etablissement: Etablissement | null;

  @OneToMany(() => RefreshToken, (token) => token.utilisateur)
  refresh_tokens: RefreshToken[];

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 3 })
  updated_at: Date;
}