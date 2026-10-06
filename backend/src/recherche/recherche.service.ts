import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { Projet } from '../projets/entities/projet.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { QueryRechercheDto, TypeRecherche } from './dto/query-recherche.dto';
import { ResultatRechercheDto, RechercheResponseDto } from './dto/recherche-response.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class RechercheService {
  constructor(
    @InjectRepository(Partenaire) private partenaireRepo: Repository<Partenaire>,
    @InjectRepository(Partenariat) private partenariatRepo: Repository<Partenariat>,
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    @InjectRepository(Convention) private conventionRepo: Repository<Convention>,
    @InjectRepository(CotutelleThese) private cotutelleRepo: Repository<CotutelleThese>,
  ) {}

  async rechercher(
    query: QueryRechercheDto,
    role: Role,
    etablissementId?: string | null,
  ): Promise<RechercheResponseDto> {
    const { q, type = TypeRecherche.TOUT, page = 1, limit = 20 } = query;
    const filtreEtab = role === Role.ETABLISSEMENT && etablissementId ? etablissementId : undefined;

    const resultats: ResultatRechercheDto[] = [];

    if (type === TypeRecherche.TOUT || type === TypeRecherche.PARTENAIRES) {
      resultats.push(...(await this.rechercherPartenaires(q, filtreEtab)));
    }
    if (type === TypeRecherche.TOUT || type === TypeRecherche.PARTENARIATS) {
      resultats.push(...(await this.rechercherPartenariats(q, filtreEtab)));
    }
    if (type === TypeRecherche.TOUT || type === TypeRecherche.PROJETS) {
      resultats.push(...(await this.rechercherProjets(q, filtreEtab)));
    }
    if (type === TypeRecherche.TOUT || type === TypeRecherche.CONVENTIONS) {
      resultats.push(...(await this.rechercherConventions(q, filtreEtab)));
    }
    if (type === TypeRecherche.TOUT || type === TypeRecherche.COTUTELLES) {
      resultats.push(...(await this.rechercherCotutelles(q, filtreEtab)));
    }

    const total = resultats.length;
    const pagines = resultats.slice((page - 1) * limit, page * limit);

    return {
      q,
      resultats: pagines,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async rechercherPartenaires(
    q: string,
    etablissementId?: string,
  ): Promise<ResultatRechercheDto[]> {
    const where: FindOptionsWhere<Partenaire>[] = [
      { archive: false, nom: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
      { archive: false, type: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
      { archive: false, pays: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
      { archive: false, description: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
    ];
    const data = await this.partenaireRepo.find({ where, take: 20 });
    return data.map((p) => ({
      id: p.id,
      type: 'partenaire',
      titre: p.nom,
      description: p.description,
      url: `/partenaires/${p.id}`,
    }));
  }

  private async rechercherPartenariats(
    q: string,
    etablissementId?: string,
  ): Promise<ResultatRechercheDto[]> {
    const where: FindOptionsWhere<Partenariat>[] = [
      {
        archive: false,
        intitule: ILike(`%${q}%`),
        ...(etablissementId ? { etablissements: { etablissement_id: etablissementId } } : {}),
      },
      {
        archive: false,
        objet: ILike(`%${q}%`),
        ...(etablissementId ? { etablissements: { etablissement_id: etablissementId } } : {}),
      },
    ];
    const data = await this.partenariatRepo.find({ where, take: 20 });
    return data.map((p) => ({
      id: p.id,
      type: 'partenariat',
      titre: p.intitule,
      description: p.objet,
      url: `/partenariats/${p.id}`,
    }));
  }

  private async rechercherProjets(
    q: string,
    etablissementId?: string,
  ): Promise<ResultatRechercheDto[]> {
    const where: FindOptionsWhere<Projet>[] = [
      { archive: false, nom: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
      { archive: false, intitule_officiel: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
      { archive: false, type: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
      { archive: false, domaine: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
    ];
    const data = await this.projetRepo.find({ where, take: 20 });
    return data.map((p) => ({
      id: p.id,
      type: 'projet',
      titre: p.nom,
      description: p.intitule_officiel,
      url: `/projets/${p.id}`,
    }));
  }

  private async rechercherConventions(
    q: string,
    etablissementId?: string,
  ): Promise<ResultatRechercheDto[]> {
    const where: FindOptionsWhere<Convention>[] = [
      { archive: false, reference: ILike(`%${q}%`), ...(etablissementId ? { projet: { etablissement_id: etablissementId } } : {}) },
      { archive: false, titre: ILike(`%${q}%`), ...(etablissementId ? { projet: { etablissement_id: etablissementId } } : {}) },
      { archive: false, description: ILike(`%${q}%`), ...(etablissementId ? { projet: { etablissement_id: etablissementId } } : {}) },
    ];
    const data = await this.conventionRepo.find({ where, take: 20 });
    return data.map((c) => ({
      id: c.id,
      type: 'convention',
      titre: c.titre,
      description: c.reference,
      url: `/conventions/${c.id}`,
    }));
  }

  private async rechercherCotutelles(
    q: string,
    etablissementId?: string,
  ): Promise<ResultatRechercheDto[]> {
    const where: FindOptionsWhere<CotutelleThese>[] = [
      { archive: false, nom_doctorant: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
      { archive: false, specialite: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
      { archive: false, directeur_these_local: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
      { archive: false, directeur_these_partenaire: ILike(`%${q}%`), ...(etablissementId ? { etablissement_id: etablissementId } : {}) },
    ];
    const data = await this.cotutelleRepo.find({ where, take: 20 });
    return data.map((c) => ({
      id: c.id,
      type: 'cotutelle',
      titre: c.nom_doctorant,
      description: c.specialite,
      url: `/cotutelles/${c.id}`,
    }));
  }
}