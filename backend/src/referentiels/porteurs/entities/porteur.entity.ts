import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { TypePorteur } from '../../../common/enums/type-porteur.enum';
import { Etablissement } from '../../../etablissements/entities/etablissement.entity';

@Entity('Porteur')
@Index(['etablissement_id'])
export class Porteur {
  @PrimaryColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TypePorteur,
    enumName: 'TypePorteur',
    default: TypePorteur.PERSONNE,
  })
  type_porteur: TypePorteur;

  @Column({ type: 'varchar', nullable: true })
  nom: string | null;

  @Column({ type: 'varchar', nullable: true })
  institution_rattachement: string | null;

  @Column({ type: 'text', nullable: true })
  etablissement_id: string | null;

  @ManyToOne(() => Etablissement, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'etablissement_id' })
  etablissement: Etablissement | null;

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
