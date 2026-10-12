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
import { Etablissement } from '../../etablissements/entities/etablissement.entity';

@Entity('SyntheseItem')
@Unique(['etablissement_id', 'annee', 'type'])
@Index(['etablissement_id', 'annee'])
export class SyntheseItem {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  etablissement_id: string;

  @Column({ type: 'int' })
  annee: number;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'text' })
  valeur: string;

  @ManyToOne(() => Etablissement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etablissement_id' })
  etablissement: Etablissement;

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
