import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToMany,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Utilisateur } from '../../auth/entities/utilisateur.entity';
import { Partenaire } from '../../partenaires/entities/partenaire.entity';
import { PartenariatEtablissement } from '../../partenariats/entities/partenariat-etablissement.entity';
import { Projet } from '../../projets/entities/projet.entity';
import { CotutelleThese } from '../../cotutelles/entities/cotutelle-these.entity';
import { SyntheseItem } from '../../synthese/entities/synthese-item.entity';
import { SynthesePartenaireStrategique } from '../../synthese/entities/synthese-partenaire-strategique.entity';

@Entity('Etablissement')
@Index(['nom'])
export class Etablissement {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ type: 'varchar', nullable: true })
  sigle: string | null;

  @Column({ type: 'varchar', nullable: true })
  logo_url: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => Utilisateur, (u) => u.etablissement)
  utilisateurs: Utilisateur[];

  @OneToMany(() => Partenaire, (p) => p.etablissement)
  partenaires: Partenaire[];

  @OneToMany(() => PartenariatEtablissement, (pe) => pe.etablissement)
  partenariats: PartenariatEtablissement[];

  @OneToMany(() => Projet, (p) => p.etablissement)
  projets: Projet[];

  @OneToMany(() => CotutelleThese, (c) => c.etablissement)
  cotutelles: CotutelleThese[];

  @OneToMany(() => SyntheseItem, (s) => s.etablissement)
  synthese_items: SyntheseItem[];

  @OneToMany(() => SynthesePartenaireStrategique, (s) => s.etablissement)
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
