import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projet } from '../../projets/entities/projet.entity';
import { FiltresExportDto } from '../dto/filtres-export.dto';
import {
  ChampDateExport,
  ModePeriodeExport,
  PorteeExport,
} from '../export.enums';
import { ajouterFiltrePeriodeExport } from '../filtre-periode-export';
import { DonneesEntiteExport, ExporteurEntite } from '../exporteur.interface';
import {
  ajouterFiltreStatutsExport,
  estEnRetardExport,
  libelleStatutExport,
} from '../statuts-export';
import { formaterDateExport } from '../formatage-export';

@Injectable()
export class ProjetExporteur implements ExporteurEntite {
  readonly portee = PorteeExport.PROJETS;

  constructor(
    @InjectRepository(Projet)
    private readonly projets: Repository<Projet>,
  ) {}

  async construireRequete(
    filtres: FiltresExportDto,
    maintenant: Date,
  ): Promise<DonneesEntiteExport> {
    const requete = this.projets
      .createQueryBuilder('projet')
      .leftJoinAndSelect('projet.etablissement', 'etablissement')
      .leftJoinAndSelect('projet.partenariat', 'partenariat')
      .leftJoinAndSelect('projet.porteur', 'porteur')
      .leftJoinAndSelect('porteur.etablissement', 'etablissementPorteur')
      .where('projet.archive = :archive', { archive: false });

    const dates: Record<ChampDateExport, string> = {
      // Les projets n'ont pas de date de signature : la date de création sert
      // de date de référence pour ce choix de période.
      [ChampDateExport.SIGNATURE]: 'projet.created_at',
      [ChampDateExport.DEBUT]: 'projet.date_debut',
      [ChampDateExport.FIN]: 'projet.date_fin_prevue',
    };
    if (filtres.periode.mode !== ModePeriodeExport.TOUT) {
      ajouterFiltrePeriodeExport(
        requete,
        dates[filtres.periode.champ_date!],
        filtres.periode,
      );
    }

    ajouterFiltreStatutsExport(
      requete,
      'PROJETS',
      'projet.statut',
      'projet.date_fin_prevue',
      filtres.statuts,
      maintenant,
    );

    const entites = await requete.orderBy('projet.nom', 'ASC').getMany();
    return {
      portee: this.portee,
      libelle: 'Projets',
      nomFeuille: 'Projets',
      nomFichier: 'projets.csv',
      colonnes: [
        { cle: 'nom', entete: 'Nom du projet', largeur: 32 },
        { cle: 'type', entete: 'Type', largeur: 18 },
        { cle: 'domaine', entete: 'Domaine', largeur: 22 },
        { cle: 'statut', entete: 'Statut', largeur: 18 },
        { cle: 'date_debut', entete: 'Date de début', largeur: 16 },
        { cle: 'date_fin_prevue', entete: 'Date de fin prévue', largeur: 19 },
        { cle: 'budget', entete: 'Budget', largeur: 18 },
        { cle: 'etablissement', entete: 'Établissement', largeur: 30 },
        { cle: 'partenariat', entete: 'Partenariat', largeur: 30 },
        { cle: 'porteur', entete: 'Porteur', largeur: 26 },
      ],
      lignes: entites.map((projet) => ({
        nom: projet.nom,
        type: projet.type,
        domaine: projet.domaine ?? '',
        statut: libelleStatutExport(
          projet.statut,
          estEnRetardExport(
            'PROJETS',
            projet.statut,
            projet.date_fin_prevue,
            maintenant,
          ),
        ),
        date_debut: formaterDateExport(projet.date_debut),
        date_fin_prevue: formaterDateExport(projet.date_fin_prevue),
        budget:
          projet.budget === null
            ? ''
            : Number(projet.budget).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
        etablissement: projet.etablissement?.nom ?? '',
        partenariat: projet.partenariat?.intitule ?? '',
        porteur:
          projet.porteur?.nom ??
          projet.porteur?.institution_rattachement ??
          projet.porteur?.etablissement?.nom ??
          '',
      })),
    };
  }
}
