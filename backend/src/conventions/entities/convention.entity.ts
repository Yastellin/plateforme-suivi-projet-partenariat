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
  OneToMany,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { StatutConvention } from '../../common/enums/statut-convention.enum';
import { Partenariat } from '../../partenariats/entities/partenariat.entity';
import { Projet } from '../../projets/entities/projet.entity';
import { Document } from '../../documents/entities/document.entity';
import { CotutelleThese } from '../../cotutelles/entities/cotutelle-these.entity';

@Entity('Convention')
@Index(['reference'])
@Index(['statut'])
@Index(['date_debut', 'date_fin'])
@Index(['archive'])
@Index(['partenariat_id'])
@Index(['projet_id'])
export class Convention {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  reference: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  date_signature: Date | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  date_debut: Date | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  date_fin: Date | null;

  @Column({ type: 'enum', enum: StatutConvention, enumName: 'StatutConvention', default: StatutConvention.BROUILLON })
  statut: StatutConvention;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ default: false })
  archive: boolean;

  @Column({ type: 'uuid', nullable: true })
  partenariat_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  projet_id: string | null;

  @ManyToOne(() => Partenariat, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'partenariat_id' })
  partenariat: Partenariat | null;

  @ManyToOne(() => Projet, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'projet_id' })
  projet: Projet | null;

  @OneToMany(() => Document, (d) => d.convention)
  documents: Document[];

  @OneToMany(() => CotutelleThese, (c) => c.convention)
  cotutelles: CotutelleThese[];

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