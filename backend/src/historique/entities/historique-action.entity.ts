// backend/src/historique/entities/historique-action.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { ActionHistorique } from '../../common/enums/action-historique.enum';

@Entity('HistoriqueAction')
@Index(['entite_type', 'entite_id'])
@Index(['utilisateur_id'])
@Index(['action'])
@Index(['date_creation'])
export class HistoriqueAction {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  utilisateur_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  utilisateur_nom: string | null;

  @Column({ type: 'varchar', nullable: true })
  utilisateur_role: string | null;

  @Column({
    type: 'enum',
    enum: ActionHistorique,
    enumName: 'ActionHistorique',
  })
  action: ActionHistorique;

  @Column({ type: 'varchar' })
  entite_type: string;

  @Column({ type: 'uuid', nullable: true })
  entite_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  entite_nom: string | null;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @Column({ type: 'timestamp', precision: 3 })
  date_creation: Date;

  @BeforeInsert()
  preparerInsertion() {
    const maintenant = new Date();
    if (!this.id) this.id = randomUUID();
    if (!this.date_creation) this.date_creation = maintenant;
  }
}
