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
import { Partenaire } from '../../partenaires/entities/partenaire.entity';

@Entity('SynthesePartenaireStrategique')
@Unique(['etablissement_id', 'annee', 'partenaire_id'])
@Index(['etablissement_id', 'annee'])
export class SynthesePartenaireStrategique {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  etablissement_id: string;

  @Column({ type: 'int' })
  annee: number;

  @Column({ type: 'uuid' })
  partenaire_id: string;

  @ManyToOne(() => Etablissement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etablissement_id' })
  etablissement: Etablissement;

  @ManyToOne(() => Partenaire, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

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
