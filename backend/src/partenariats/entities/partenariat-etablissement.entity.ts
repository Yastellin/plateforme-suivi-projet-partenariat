import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  Unique,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Partenariat } from './partenariat.entity';
import { Etablissement } from '../../etablissements/entities/etablissement.entity';

@Entity('PartenariatEtablissement')
@Unique(['partenariat_id', 'etablissement_id'])
export class PartenariatEtablissement {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  partenariat_id: string;

  @Column({ type: 'uuid' })
  etablissement_id: string;

  @ManyToOne(() => Partenariat, (p) => p.etablissements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'partenariat_id' })
  partenariat: Partenariat;

  @ManyToOne(() => Etablissement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'etablissement_id' })
  etablissement: Etablissement;

  @BeforeInsert()
  preparerInsertion() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}
