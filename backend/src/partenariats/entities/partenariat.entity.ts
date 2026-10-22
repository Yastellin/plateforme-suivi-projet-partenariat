import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { DomainePartenariat } from '../../common/enums/domaine-partenariat.enum';
import { StatutPartenariat } from '../../common/enums/statut-partenariat.enum';
import { PartenariatEtablissement } from './partenariat-etablissement.entity';
import { PartenariatPartenaire } from './partenariat-partenaire.entity';
import { Projet } from '../../projets/entities/projet.entity';
import { Convention } from '../../conventions/entities/convention.entity';

@Entity('Partenariat')
@Index(['archive'])
@Index(['statut'])
@Index(['date_debut', 'date_fin'])
export class Partenariat {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  intitule: string;

  @Column({ type: 'text', nullable: true })
  objet: string | null;

  @Column({
    type: 'enum',
    enum: DomainePartenariat,
    enumName: 'DomainePartenariat',
  })
  domaine: DomainePartenariat;

  @Column({ type: 'timestamp', precision: 3 })
  date_debut: Date;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  date_fin: Date | null;

  @Column({
    type: 'enum',
    enum: StatutPartenariat,
    enumName: 'StatutPartenariat',
    default: StatutPartenariat.BROUILLON,
  })
  statut: StatutPartenariat;

  @Column({ type: 'text', nullable: true })
  actions_realisees: string | null;

  @Column({ type: 'text', nullable: true })
  actions_en_cours: string | null;

  @Column({ type: 'text', nullable: true })
  actions_prevues: string | null;

  @Column({ type: 'text', nullable: true })
  resultats_obtenus: string | null;

  @Column({ type: 'text', nullable: true })
  difficultes_contraintes: string | null;

  @Column({ type: 'text', nullable: true })
  perspectives_recommandations: string | null;

  @Column({ default: false })
  archive: boolean;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  soumis_le: Date | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  publie_le: Date | null;

  @Column({ type: 'text', nullable: true })
  cree_par_utilisateur_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  cree_par_role: string | null;

  @OneToMany(() => PartenariatEtablissement, (pe) => pe.partenariat)
  etablissements: PartenariatEtablissement[];

  @OneToMany(() => PartenariatPartenaire, (pp) => pp.partenariat)
  partenaires: PartenariatPartenaire[];

  @OneToMany(() => Projet, (p) => p.partenariat)
  projets: Projet[];

  @OneToMany(() => Convention, (c) => c.partenariat)
  conventions: Convention[];

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
