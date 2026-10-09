import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Role } from '../../common/enums/role.enum';
import { Etablissement } from '../../etablissements/entities/etablissement.entity';
import { RefreshToken } from './refresh-token.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { PasswordResetToken } from './password-reset-token.entity';

@Entity('Utilisateur')
@Index(['etablissement_id'])
@Index(['role'])
@Index(['actif'])
export class Utilisateur {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password_hash: string;

  @Column({ type: 'enum', enum: Role, enumName: 'Role' })
  role: Role;

  @Column({ type: 'uuid', nullable: true })
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

  @OneToMany(() => PasswordResetToken, (t) => t.utilisateur)
  password_reset_tokens: PasswordResetToken[];

  @OneToMany(() => Notification, (n) => n.utilisateur)
  notifications: Notification[];

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 3 })
  updated_at: Date;

  @BeforeInsert()
  preparerInsertion() {
    const maintenant = new Date();
    if (!this.id) {
      this.id = randomUUID();
    }
    if (!this.created_at) {
      this.created_at = maintenant;
    }
    if (!this.updated_at) {
      this.updated_at = maintenant;
    }
  }

  @BeforeUpdate()
  preparerMiseAJour() {
    this.updated_at = new Date();
  }
}