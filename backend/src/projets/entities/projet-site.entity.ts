import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, BeforeInsert, Unique,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Projet } from './projet.entity';
import { Site } from '../../referentiels/sites/entities/site.entity';

@Entity('ProjetSite')
@Unique(['projet_id', 'site_id'])
export class ProjetSite {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projet_id: string;

  @Column({ type: 'uuid' })
  site_id: string;

  @ManyToOne(() => Projet, (p) => p.sites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projet_id' })
  projet: Projet;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @BeforeInsert()
  genererId() {
    if (!this.id) this.id = randomUUID();
  }
}