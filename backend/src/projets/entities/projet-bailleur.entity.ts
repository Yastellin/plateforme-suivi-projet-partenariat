import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, BeforeInsert, Unique,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Projet } from './projet.entity';
import { Bailleur } from '../../referentiels/bailleurs/entities/bailleur.entity';

@Entity('ProjetBailleur')
@Unique(['projet_id', 'bailleur_id'])
export class ProjetBailleur {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projet_id: string;

  @Column({ type: 'uuid' })
  bailleur_id: string;

  @ManyToOne(() => Projet, (p) => p.bailleurs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projet_id' })
  projet: Projet;

  @ManyToOne(() => Bailleur, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bailleur_id' })
  bailleur: Bailleur;

  @BeforeInsert()
  genererId() {
    if (!this.id) this.id = randomUUID();
  }
}