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
import { Partenaire } from '../../partenaires/entities/partenaire.entity';

@Entity('PartenariatPartenaire')
@Unique(['partenariat_id', 'partenaire_id'])
export class PartenariatPartenaire {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  partenariat_id: string;

  @Column({ type: 'uuid' })
  partenaire_id: string;

  @ManyToOne(() => Partenariat, (p) => p.partenaires, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partenariat_id' })
  partenariat: Partenariat;

  @ManyToOne(() => Partenaire, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @BeforeInsert()
  preparerInsertion() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }
}