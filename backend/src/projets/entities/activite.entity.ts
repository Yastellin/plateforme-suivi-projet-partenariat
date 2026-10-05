import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn,
  UpdateDateColumn, BeforeInsert, Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Projet } from './projet.entity';

@Entity('Activite')
@Index(['projet_id'])
@Index(['terminee'])
@Index(['date_echeance'])
export class Activite {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  intitule: string;

  @Column({ type: 'int' })
  ordre: number;

  @Column({ default: false })
  terminee: boolean;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  date_echeance: Date | null;

  @Column({ type: 'uuid' })
  projet_id: string;

  @ManyToOne(() => Projet, (p) => p.activites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projet_id' })
  projet: Projet;

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 3 })
  updated_at: Date;

  @BeforeInsert()
  genererId() {
    if (!this.id) this.id = randomUUID();
  }
}