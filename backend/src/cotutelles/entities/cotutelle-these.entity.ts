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
import { TypeCotutelle } from '../../common/enums/type-cotutelle.enum';
import { Etablissement } from '../../etablissements/entities/etablissement.entity';
import { Partenaire } from '../../partenaires/entities/partenaire.entity';
import { Convention } from '../../conventions/entities/convention.entity';

@Entity('CotutelleThese')
@Index(['etablissement_id'])
@Index(['partenaire_id'])
@Index(['archive'])
export class CotutelleThese {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nom_doctorant: string;

  @Column({ type: 'varchar', nullable: true })
  specialite: string | null;

  @Column({ type: 'varchar', nullable: true })
  directeur_these_local: string | null;

  @Column({ type: 'varchar', nullable: true })
  directeur_these_partenaire: string | null;

  @Column({ type: 'enum', enum: TypeCotutelle, enumName: 'TypeCotutelle' })
  type: TypeCotutelle;

  @Column({ type: 'timestamp', precision: 3 })
  date_debut: Date;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  date_prevue_soutenance: Date | null;

  @Column({ type: 'varchar', nullable: true })
  financement_bourse: string | null;

  @Column({ type: 'text', nullable: true })
  mobilite_realisee: string | null;

  @Column({ type: 'text', nullable: true })
  publications_produites: string | null;

  @Column({ type: 'text', nullable: true })
  etat_avancement: string | null;

  @Column({ type: 'text', nullable: true })
  difficultes_rencontrees: string | null;

  @Column({ type: 'text', nullable: true })
  perspectives: string | null;

  @Column({ default: false })
  archive: boolean;

  @Column({ type: 'uuid' })
  etablissement_id: string;

  @Column({ type: 'uuid' })
  partenaire_id: string;

  @Column({ type: 'uuid', nullable: true })
  convention_id: string | null;

  @ManyToOne(() => Etablissement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etablissement_id' })
  etablissement: Etablissement;

  @ManyToOne(() => Partenaire, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @ManyToOne(() => Convention, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'convention_id'})
  convention: Convention | null;

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