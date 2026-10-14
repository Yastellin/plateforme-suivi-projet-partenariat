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
  Unique,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Activite } from '../../../projets/entities/activite.entity';

/**
 * Repartition mensuelle du temps de travail prevu pour une activite.
 * Reflete a l'identique le modele Prisma « Chronogramme » (table "Chronogramme").
 */
@Entity('Chronogramme')
@Unique(['activite_id', 'annee', 'trimestre', 'mois'])
@Index(['activite_id'])
export class Chronogramme {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  annee: number;

  @Column({ type: 'int' })
  trimestre: number;

  @Column({ type: 'int' })
  mois: number;

  @Column({ type: 'numeric', precision: 6, scale: 1 })
  nombre_jours: number;

  @Column({ type: 'uuid' })
  activite_id: string;

  @ManyToOne(() => Activite, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activite_id' })
  activite: Activite;

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
