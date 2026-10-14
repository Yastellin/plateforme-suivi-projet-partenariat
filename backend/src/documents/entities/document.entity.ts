//backend/src/documents/entities/document.entity.ts
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
import { TypeDocument } from '../../common/enums/type-document.enum';
import { Projet } from '../../projets/entities/projet.entity';
import { Convention } from '../../conventions/entities/convention.entity';

@Entity('Document')
@Index(['projet_id'])
@Index(['convention_id'])
@Index(['est_archive'])
export class Document {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nom_fichier: string;

  @Column({ type: 'varchar' })
  url_fichier: string;

  @Column({ type: 'enum', enum: TypeDocument, enumName: 'TypeDocument' })
  type: TypeDocument;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ default: false })
  est_archive: boolean;

  @Column({ type: 'uuid', nullable: true })
  projet_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  convention_id: string | null;

  @ManyToOne(() => Projet, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'projet_id' })
  projet: Projet | null;

  @ManyToOne(() => Convention, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'convention_id' })
  convention: Convention | null;

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 3 })
  updated_at: Date;

  @BeforeInsert()
  preparerInsertion() {
    const maintenant = new Date();
    if (!this.id) {
      this.id = randomUUID();
    }
    if (!this.created_at) {
      this.created_at = maintenant;
    }
    if (!this.updated_at) {
      this.updated_at = maintenant;
    }
  }

  @BeforeUpdate()
  preparerMiseAJour() {
    this.updated_at = new Date();
  }
}
