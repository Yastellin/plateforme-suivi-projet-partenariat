import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExportHistorique } from './entities/export-historique.entity';
import { FiltresExportDto } from './dto/filtres-export.dto';
import { PorteeExport } from './export.enums';
import { DonneesEntiteExport, ExporteurEntite } from './exporteur.interface';
import { GenerateurExportAvanceService } from './generateur-export-avance.service';
import { ConventionExporteur } from './exporteurs/convention-exporteur';
import { ProjetExporteur } from './exporteurs/projet-exporteur';
import { PartenariatExporteur } from './exporteurs/partenariat-exporteur';
import { PartenaireExporteur } from './exporteurs/partenaire-exporteur';

export interface UtilisateurExport {
  id: string;
  email?: string;
}

export interface ApercuExport {
  portee: PorteeExport;
  date_apercu: string;
  total_lignes: number;
  par_entite: {
    conventions: number;
    projets: number;
    partenariats: number;
    partenaires: number;
  };
  formats: {
    XLSX: { nombre_fichiers: number; description: string };
    PDF: { nombre_fichiers: number; description: string };
    CSV: { nombre_fichiers: number; description: string; fichiers: string[] };
  };
}

export interface HistoriqueExportReponse {
  id: string;
  date_creation: Date;
  utilisateur: string;
  portee: string;
  filtres: Record<string, unknown>;
  format: string;
  nombre_lignes: number;
}

@Injectable()
export class ExportAvanceService {
  private readonly exporteurs: ExporteurEntite[];

  constructor(
    conventions: ConventionExporteur,
    projets: ProjetExporteur,
    partenariats: PartenariatExporteur,
    partenaires: PartenaireExporteur,
    private readonly generateur: GenerateurExportAvanceService,
    @InjectRepository(ExportHistorique)
    private readonly historiques: Repository<ExportHistorique>,
  ) {
    this.exporteurs = [conventions, projets, partenariats, partenaires];
  }

  async apercu(filtres: FiltresExportDto): Promise<ApercuExport> {
    const maintenant = new Date();
    const donnees = await this.construireDonnees(filtres, maintenant);
    const parEntite = {
      conventions: this.nombre(donnees, PorteeExport.CONVENTIONS),
      projets: this.nombre(donnees, PorteeExport.PROJETS),
      partenariats: this.nombre(donnees, PorteeExport.PARTENARIATS),
      partenaires: this.nombre(donnees, PorteeExport.PARTENAIRES),
    };
    const nomsCsv = [
      'Informations.csv',
      ...donnees.map((entite) => entite.nomFichier),
    ];

    return {
      portee: filtres.portee,
      date_apercu: maintenant.toISOString(),
      total_lignes: Object.values(parEntite).reduce(
        (total, nombre) => total + nombre,
        0,
      ),
      par_entite: parEntite,
      formats: {
        XLSX: {
          nombre_fichiers: 1,
          description:
            'Un classeur avec une feuille d’informations et une feuille par entité.',
        },
        PDF: {
          nombre_fichiers: 1,
          description:
            'Un document avec une page d’informations et un tableau par entité.',
        },
        CSV: {
          nombre_fichiers: nomsCsv.length,
          description:
            'Une archive ZIP contenant le fichier d’informations et un CSV par entité.',
          fichiers: nomsCsv,
        },
      },
    };
  }

  async exporter(filtres: FiltresExportDto, utilisateur: UtilisateurExport) {
    const dateGeneration = new Date();
    const donnees = await this.construireDonnees(filtres, dateGeneration);
    const nombreLignes = donnees.reduce(
      (total, entite) => total + entite.lignes.length,
      0,
    );
    const fichier = await this.generateur.generer(filtres.format, donnees, {
      filtres,
      libelleUtilisateur: utilisateur.email ?? utilisateur.id,
      dateGeneration,
    });

    await this.historiques.save(
      this.historiques.create({
        utilisateur_id: utilisateur.id,
        portee: filtres.portee,
        filtres: this.filtresHistorises(filtres),
        format: filtres.format,
        nombre_lignes: nombreLignes,
      }),
    );
    return { fichier, nombreLignes };
  }

  async listerHistorique(
    page: number,
    limit: number,
  ): Promise<{
    data: HistoriqueExportReponse[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const requete = this.historiques
      .createQueryBuilder('historique')
      .leftJoin('historique.utilisateur', 'utilisateur')
      .addSelect(['utilisateur.id', 'utilisateur.email'])
      .orderBy('historique.date_creation', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [historiques, total] = await requete.getManyAndCount();
    return {
      data: historiques.map((historique) => ({
        id: historique.id,
        date_creation: historique.date_creation,
        utilisateur: historique.utilisateur?.email ?? 'Compte supprimé',
        portee: historique.portee,
        filtres: historique.filtres,
        format: historique.format,
        nombre_lignes: historique.nombre_lignes,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private async construireDonnees(
    filtres: FiltresExportDto,
    maintenant: Date,
  ): Promise<DonneesEntiteExport[]> {
    // Une sélection de statuts vide signifie explicitement un aperçu/export vide,
    // même si les partenaires eux-mêmes ne sont pas filtrés par leur statut.
    if (filtres.statuts.length === 0) return [];

    const selectionnes = this.exporteurs.filter(
      (exporteur) =>
        filtres.portee === PorteeExport.TOUT ||
        exporteur.portee === filtres.portee,
    );
    return Promise.all(
      selectionnes.map((exporteur) =>
        exporteur.construireRequete(filtres, maintenant),
      ),
    );
  }

  private nombre(
    donnees: DonneesEntiteExport[],
    portee: Exclude<PorteeExport, PorteeExport.TOUT>,
  ): number {
    return (
      donnees.find((entite) => entite.portee === portee)?.lignes.length ?? 0
    );
  }

  private filtresHistorises(
    filtres: FiltresExportDto,
  ): Record<string, unknown> {
    return {
      portee: filtres.portee,
      periode: { ...filtres.periode },
      statuts: [...filtres.statuts],
      format: filtres.format,
    };
  }
}
