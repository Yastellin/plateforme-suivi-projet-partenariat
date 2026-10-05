import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryRechercheDto, TypeRecherche } from './dto/query-recherche.dto';
import { ResultatRechercheDto, RechercheResponseDto } from './dto/recherche-response.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class RechercheService {
  constructor(private prisma: PrismaService) {}

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
    const where: any = {
      archive: false,
      OR: [
        { nom: { contains: q, mode: 'insensitive' } },
        { type: { contains: q, mode: 'insensitive' } },
        { pays: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    };
    if (etablissementId) where.etablissement_id = etablissementId;

    const data = await this.prisma.partenaire.findMany({ where, take: 20 });
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
    const where: any = {
      archive: false,
      OR: [
        { intitule: { contains: q, mode: 'insensitive' } },
        { objet: { contains: q, mode: 'insensitive' } },
      ],
    };
    if (etablissementId) {
      where.etablissements = { some: { etablissement_id: etablissementId } };
    }

    const data = await this.prisma.partenariat.findMany({ where, take: 20 });
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
    const where: any = {
      archive: false,
      OR: [
        { nom: { contains: q, mode: 'insensitive' } },
        { intitule_officiel: { contains: q, mode: 'insensitive' } },
        { type: { contains: q, mode: 'insensitive' } },
        { domaine: { contains: q, mode: 'insensitive' } },
      ],
    };
    if (etablissementId) where.etablissement_id = etablissementId;

    const data = await this.prisma.projet.findMany({ where, take: 20 });
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
    const where: any = {
      archive: false,
      OR: [
        { reference: { contains: q, mode: 'insensitive' } },
        { titre: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    };
    if (etablissementId) {
      where.projet = { etablissement_id: etablissementId };
    }

    const data = await this.prisma.convention.findMany({ where, take: 20 });
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
    const where: any = {
      archive: false,
      OR: [
        { nom_doctorant: { contains: q, mode: 'insensitive' } },
        { specialite: { contains: q, mode: 'insensitive' } },
        { directeur_these_local: { contains: q, mode: 'insensitive' } },
        { directeur_these_partenaire: { contains: q, mode: 'insensitive' } },
      ],
    };
    if (etablissementId) where.etablissement_id = etablissementId;

    const data = await this.prisma.cotutelleThese.findMany({ where, take: 20 });
    return data.map((c) => ({
      id: c.id,
      type: 'cotutelle',
      titre: c.nom_doctorant,
      description: c.specialite,
      url: `/cotutelles/${c.id}`,
    }));
  }
}