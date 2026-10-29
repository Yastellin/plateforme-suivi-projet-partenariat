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
import { StatutPartenaire } from '../../common/enums/statut-partenaire.enum';
import { Visibilite } from '../../common/enums/visibilite.enum';
import { Etablissement } from '../../etablissements/entities/etablissement.entity';
import { Contact } from './contact.entity';
import { PartenariatPartenaire } from '../../partenariats/entities/partenariat-partenaire.entity';
import { CotutelleThese } from '../../cotutelles/entities/cotutelle-these.entity';
import { ProjetPartenaire } from '../../projets/entities/projet-partenaire.entity';
import { SynthesePartenaireStrategique } from '../../synthese/entities/synthese-partenaire-strategique.entity';
import { Coordonnee } from '../../coordonnees/entities/coordonnee.entity';

@Entity('Partenaire')
@Index(['etablissement_id'])
@Index(['archive'])
@Index(['nom'])
@Index(['statut'])
export class Partenaire {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nom: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar' })
  pays: string;

  @Column({ type: 'varchar', nullable: true })
  adresse: string | null;

  @Column({ type: 'varchar', nullable: true })
  telephone: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  site_web: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: StatutPartenaire,
    enumName: 'StatutPartenaire',
    default: StatutPartenaire.ACTIF,
  })
  statut: StatutPartenaire;

  @Column({
    type: 'enum',
    enum: Visibilite,
    enumName: 'Visibilite',
    default: Visibilite.PRIVE,
  })
  visibilite: Visibilite;

  @Column({ default: false })
  est_strategique: boolean;

  @Column({ type: 'varchar', nullable: true })
  logo_url: string | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  soumis_le: Date | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  publie_le: Date | null;

  @Column({ type: 'text', nullable: true })
  cree_par_utilisateur_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  cree_par_role: string | null;

  @Column({ default: false })
  archive: boolean;

  @Column({ type: 'uuid', nullable: true })
  etablissement_id: string | null;

  @ManyToOne(() => Etablissement, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'etablissement_id' })
  etablissement: Etablissement | null;

  @OneToMany(() => Contact, (contact) => contact.partenaire, { cascade: true })
  contacts: Contact[];

  @OneToMany(() => Coordonnee, (coordonnee) => coordonnee.partenaire)
  coordonnees: Coordonnee[];

  @OneToMany(() => PartenariatPartenaire, (pp) => pp.partenaire)
  partenariats: PartenariatPartenaire[];

  @OneToMany(() => CotutelleThese, (c) => c.partenaire)
  cotutelles: CotutelleThese[];

  @OneToMany(() => ProjetPartenaire, (pp) => pp.partenaire)
  projets: ProjetPartenaire[];

  @OneToMany(() => SynthesePartenaireStrategique, (s) => s.partenaire)
  synthese_partenaires_strategiques: SynthesePartenaireStrategique[];

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
