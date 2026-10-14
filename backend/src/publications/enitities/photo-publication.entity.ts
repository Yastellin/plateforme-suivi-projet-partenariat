import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Publication } from './publication.entity';

@Entity('PhotoPublication')
@Index(['publication_id', 'ordre'])
export class PhotoPublication {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  url_fichier: string;

  @Column({ type: 'varchar', nullable: true })
  legende: string | null;

  @Column({ type: 'int', default: 0 })
  ordre: number;

  @Column({ type: 'uuid' })
  publication_id: string;

  @ManyToOne(() => Publication, (p) => p.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'publication_id' })
  publication: Publication;

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
