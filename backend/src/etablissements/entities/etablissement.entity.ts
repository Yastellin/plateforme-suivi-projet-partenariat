import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('Etablissement')
@Index(['nom'])
export class Etablissement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ nullable: true })
  sigle: string | null;

  @Column({ nullable: true })
  logo_url: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // Relations (OneToMany) ajoutees au fur et a mesure de la migration
  // pour eviter les imports circulaires prematurement.

  @CreateDateColumn({ type: 'timestamp', precision: 3 })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', precision: 3 })
  updated_at: Date;
}