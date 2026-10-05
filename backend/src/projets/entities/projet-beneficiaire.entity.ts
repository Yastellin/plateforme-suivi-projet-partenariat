import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, BeforeInsert, Unique,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Projet } from './projet.entity';
import { Beneficiaire } from '../../referentiels/beneficiaires/entities/beneficiaire.entity';

@Entity('ProjetBeneficiaire')
@Unique(['projet_id', 'beneficiaire_id'])
export class ProjetBeneficiaire {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projet_id: string;

  @Column({ type: 'uuid' })
  beneficiaire_id: string;

  @ManyToOne(() => Projet, (p) => p.beneficiaires, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projet_id' })
  projet: Projet;

  @ManyToOne(() => Beneficiaire, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'beneficiaire_id' })
  beneficiaire: Beneficiaire;

  @BeforeInsert()
  genererId() {
    if (!this.id) this.id = randomUUID();
  }
}