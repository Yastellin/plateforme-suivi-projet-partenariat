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
  OneToOne,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { StatutProjet } from '../../common/enums/statut-projet.enum';
import { Etablissement } from '../../etablissements/entities/etablissement.entity';
import { Partenariat } from '../../partenariats/entities/partenariat.entity';
import { Porteur } from '../../referentiels/porteurs/entities/porteur.entity';
import { ProjetPartenaire } from './projet-partenaire.entity';
import { ProjetBeneficiaire } from './projet-beneficiaire.entity';
import { ProjetBailleur } from './projet-bailleur.entity';
import { ProjetSite } from './projet-site.entity';
import { Activite } from './activite.entity';
import { Document } from '../../documents/entities/document.entity';
import { Convention } from '../../conventions/entities/convention.entity';
import { Publication } from '../../publications/enitities/publication.entity';

@Entity('Projet')
@Index(['etablissement_id'])
@Index(['statut'])
@Index(['archive'])
@Index(['date_debut', 'date_fin_prevue'])
@Index(['partenariat_id'])
export class Projet {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nom: string;

  @Column({ type: 'varchar', nullable: true })
  intitule_officiel: string | null;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  domaine: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number | null;

  @Column({ type: 'timestamp', precision: 3 })
  date_debut: Date;

  @Column({ type: 'timestamp', precision: 3 })
  date_fin_prevue: Date;

  @Column({
    type: 'enum',
    enum: StatutProjet,
    enumName: 'StatutProjet',
    default: StatutProjet.BROUILLON,
  })
  statut: StatutProjet;

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

  // Facultatif : un projet peut etre transversal ou gere directement par la
  // Presidence, sans etablissement rattaché.
  @Column({ type: 'text', nullable: true })
  etablissement_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  partenariat_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  porteur_id: string | null;

  @ManyToOne(() => Etablissement, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'etablissement_id' })
  etablissement: Etablissement | null;

  @ManyToOne(() => Partenariat, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'partenariat_id' })
  partenariat: Partenariat | null;

  @ManyToOne(() => Porteur, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'porteur_id' })
  porteur: Porteur | null;

  @OneToMany(() => ProjetPartenaire, (pp) => pp.projet)
  partenaires: ProjetPartenaire[];

  @OneToMany(() => ProjetBeneficiaire, (pb) => pb.projet)
  beneficiaires: ProjetBeneficiaire[];

  @OneToMany(() => ProjetBailleur, (pb) => pb.projet)
  bailleurs: ProjetBailleur[];

  @OneToMany(() => ProjetSite, (ps) => ps.projet)
  sites: ProjetSite[];

  @OneToMany(() => Activite, (a) => a.projet)
  activites: Activite[];

  @OneToMany(() => Document, (d) => d.projet)
  documents: Document[];

  @OneToMany(() => Convention, (c) => c.projet)
  conventions: Convention[];

  @OneToOne(() => Publication, (p) => p.projet)
  publication: Publication | null;

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