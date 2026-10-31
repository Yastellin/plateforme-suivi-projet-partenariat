import {
  BeforeInsert,
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Utilisateur } from '../../auth/entities/utilisateur.entity';

@Entity('ExportHistorique')
@Index('IDX_ExportHistorique_date_creation', ['date_creation'])
@Index('IDX_ExportHistorique_utilisateur_id', ['utilisateur_id'])
@Check('CHK_ExportHistorique_nombre_lignes', '"nombre_lignes" >= 0')
export class ExportHistorique {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'text', nullable: true })
  utilisateur_id: string | null;

  @ManyToOne(() => Utilisateur, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({
    name: 'utilisateur_id',
    foreignKeyConstraintName: 'FK_ExportHistorique_utilisateur',
  })
  utilisateur: Utilisateur | null;

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  date_creation: Date;

  @Column({ type: 'varchar' })
  portee: string;

  @Column({ type: 'jsonb' })
  filtres: Record<string, unknown>;

  @Column({ type: 'varchar' })
  format: string;

  @Column({ type: 'integer' })
  nombre_lignes: number;

  @BeforeInsert()
  preparerInsertion(): void {
    if (!this.id) this.id = randomUUID();
    if (!this.date_creation) this.date_creation = new Date();
  }
}
