import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partenariat } from '../../partenariats/entities/partenariat.entity';
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
export class PartenariatExporteur implements ExporteurEntite {
  readonly portee = PorteeExport.PARTENARIATS;

  constructor(
    @InjectRepository(Partenariat)
    private readonly partenariats: Repository<Partenariat>,
  ) {}

  async construireRequete(
    filtres: FiltresExportDto,
    maintenant: Date,
  ): Promise<DonneesEntiteExport> {
    const requete = this.partenariats
      .createQueryBuilder('partenariat')
      .leftJoinAndSelect('partenariat.etablissements', 'lienEtablissement')
      .leftJoinAndSelect('lienEtablissement.etablissement', 'etablissement')
      .leftJoinAndSelect('partenariat.partenaires', 'lienPartenaire')
      .leftJoinAndSelect('lienPartenaire.partenaire', 'partenaire')
      .where('partenariat.archive = :archive', { archive: false });

    const dates: Record<ChampDateExport, string> = {
      // Les partenariats n'ont pas de date de signature : la date de création
      // sert de date de référence pour ce choix de période.
      [ChampDateExport.SIGNATURE]: 'partenariat.created_at',
      [ChampDateExport.DEBUT]: 'partenariat.date_debut',
      [ChampDateExport.FIN]: 'partenariat.date_fin',
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
      'PARTENARIATS',
      'partenariat.statut',
      'partenariat.date_fin',
      filtres.statuts,
      maintenant,
    );

    const entites = await requete
      .orderBy('partenariat.intitule', 'ASC')
      .getMany();
    return {
      portee: this.portee,
      libelle: 'Partenariats',
      nomFeuille: 'Partenariats',
      nomFichier: 'partenariats.csv',
      colonnes: [
        { cle: 'intitule', entete: 'Intitulé', largeur: 34 },
        { cle: 'objet', entete: 'Objet', largeur: 42 },
        { cle: 'domaine', entete: 'Domaine', largeur: 24 },
        { cle: 'statut', entete: 'Statut', largeur: 18 },
        { cle: 'date_debut', entete: 'Date de début', largeur: 16 },
        { cle: 'date_fin', entete: 'Date de fin', largeur: 16 },
        { cle: 'etablissements', entete: 'Établissements', largeur: 36 },
        { cle: 'partenaires', entete: 'Partenaires associés', largeur: 36 },
        { cle: 'actions_realisees', entete: 'Actions réalisées', largeur: 40 },
        { cle: 'actions_en_cours', entete: 'Actions en cours', largeur: 40 },
        { cle: 'actions_prevues', entete: 'Actions prévues', largeur: 40 },
        { cle: 'resultats', entete: 'Résultats obtenus', largeur: 40 },
      ],
      lignes: entites.map((partenariat) => ({
        intitule: partenariat.intitule,
        objet: partenariat.objet ?? '',
        domaine: partenariat.domaine,
        statut: libelleStatutExport(
          partenariat.statut,
          estEnRetardExport(
            'PARTENARIATS',
            partenariat.statut,
            partenariat.date_fin,
            maintenant,
          ),
        ),
        date_debut: formaterDateExport(partenariat.date_debut),
        date_fin: formaterDateExport(partenariat.date_fin),
        etablissements:
          partenariat.etablissements
            ?.map((lien) => lien.etablissement?.nom)
            .filter(Boolean)
            .join(', ') ?? '',
        partenaires:
          partenariat.partenaires
            ?.map((lien) => lien.partenaire?.nom)
            .filter(Boolean)
            .join(', ') ?? '',
        actions_realisees: partenariat.actions_realisees ?? '',
        actions_en_cours: partenariat.actions_en_cours ?? '',
        actions_prevues: partenariat.actions_prevues ?? '',
        resultats: partenariat.resultats_obtenus ?? '',
      })),
    };
  }
}
