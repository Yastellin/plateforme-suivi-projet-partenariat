import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, BeforeInsert, Unique,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Projet } from './projet.entity';
import { Partenaire } from '../../partenaires/entities/partenaire.entity';

@Entity('ProjetPartenaire')
@Unique(['projet_id', 'partenaire_id'])
export class ProjetPartenaire {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projet_id: string;

  @Column({ type: 'uuid' })
  partenaire_id: string;

  @ManyToOne(() => Projet, (p) => p.partenaires, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projet_id' })
  projet: Projet;

  @ManyToOne(() => Partenaire, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partenaire_id' })
  partenaire: Partenaire;

  @BeforeInsert()
  genererId() {
    if (!this.id) this.id = randomUUID();
  }
}