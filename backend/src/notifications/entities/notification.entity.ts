import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { TypeNotification } from '../../common/enums/type-notification.enum';
import { PrioriteNotification } from '../../common/enums/priorite-notification.enum';
import { Utilisateur } from '../../auth/entities/utilisateur.entity';

@Entity('Notification')
@Index(['utilisateur_id'])
@Index(['est_lue'])
@Index(['reference_type', 'reference_id'])
export class Notification {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: TypeNotification, enumName: 'TypeNotification' })
  type: TypeNotification;

  @Column({ type: 'enum', enum: PrioriteNotification, enumName: 'PrioriteNotification', default: PrioriteNotification.MOYENNE })
  priorite: PrioriteNotification;

  @Column({ type: 'timestamp', precision: 3 })
  date_creation: Date;

  @Column({ default: false })
  est_lue: boolean;

  @Column({ type: 'uuid' })
  utilisateur_id: string;

  @ManyToOne(() => Utilisateur, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'utilisateur_id' })
  utilisateur: Utilisateur;

  @Column({ type: 'varchar' })
  reference_type: string;

  @Column({ type: 'varchar' })
  reference_id: string;

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 3 })
  updated_at: Date;

  @BeforeInsert()
  preparerInsertion() {
    const maintenant = new Date();
    if (!this.id) this.id = randomUUID();
    if (!this.date_creation) this.date_creation = maintenant;
    if (!this.created_at) this.created_at = maintenant;
    if (!this.updated_at) this.updated_at = maintenant;
  }

  @BeforeUpdate()
  preparerMiseAJour() {
    this.updated_at = new Date();
  }
}