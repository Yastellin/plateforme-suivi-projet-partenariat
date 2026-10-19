import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
  Index,
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

  // Nullable : un porteur de type ETABLISSEMENT n'a pas de nom libre.
  @Column({ type: 'varchar', nullable: true })
  nom: string | null;

  @Column({ type: 'varchar', nullable: true })
  institution_rattachement: string | null;

  // Type uuid, comme la cle primaire "Etablissement"."id" (une FK de type
  // differant de la cle referencee echoue sous PostgreSQL).
  @Column({ type: 'uuid', nullable: true })
  etablissement_id: string | null;

  @ManyToOne(() => Etablissement, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'etablissement_id' })
  etablissement: Etablissement | null;

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
