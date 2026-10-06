import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { StatutPublication } from '../../common/enums/statut-publication.enum';
import { Projet } from '../../projets/entities/projet.entity';
import { PhotoPublication } from './photo-publication.entity';

@Entity('Publication')
@Index(['statut'])
export class Publication {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  titre: string;

  @Column({ type: 'text', nullable: true })
  description_publique: string | null;

  @Column({ type: 'timestamp', precision: 3, nullable: true })
  date_publication: Date | null;

  @Column({ type: 'enum', enum: StatutPublication, enumName: 'StatutPublication', default: StatutPublication.BROUILLON })
  statut: StatutPublication;

  @Column({ type: 'text', nullable: true })
  resultats: string | null;

  @Column({ type: 'uuid', unique: true })
  projet_id: string;

  @ManyToOne(() => Projet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projet_id' })
  projet: Projet;

  @OneToMany(() => PhotoPublication, (photo) => photo.publication, { cascade: true })
  photos: PhotoPublication[];

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