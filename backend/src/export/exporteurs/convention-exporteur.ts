import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Convention } from '../../conventions/entities/convention.entity';
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
export class ConventionExporteur implements ExporteurEntite {
  readonly portee = PorteeExport.CONVENTIONS;

  constructor(
    @InjectRepository(Convention)
    private readonly conventions: Repository<Convention>,
  ) {}

  async construireRequete(
    filtres: FiltresExportDto,
    maintenant: Date,
  ): Promise<DonneesEntiteExport> {
    const requete = this.conventions
      .createQueryBuilder('convention')
      .leftJoinAndSelect('convention.projet', 'projet')
      .leftJoinAndSelect('convention.partenariat', 'partenariat')
      .where('convention.archive = :archive', { archive: false });

    const dates: Record<ChampDateExport, string> = {
      [ChampDateExport.SIGNATURE]: 'convention.date_signature',
      [ChampDateExport.DEBUT]: 'convention.date_debut',
      [ChampDateExport.FIN]: 'convention.date_fin',
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
      'CONVENTIONS',
      'convention.statut',
      'convention.date_fin',
      filtres.statuts,
      maintenant,
    );

    const entites = await requete.orderBy('convention.titre', 'ASC').getMany();
    return {
      portee: this.portee,
      libelle: 'Conventions',
      nomFeuille: 'Conventions',
      nomFichier: 'conventions.csv',
      colonnes: [
        { cle: 'reference', entete: 'Référence', largeur: 20 },
        { cle: 'titre', entete: 'Titre', largeur: 34 },
        { cle: 'statut', entete: 'Statut', largeur: 22 },
        { cle: 'date_signature', entete: 'Date de signature', largeur: 18 },
        { cle: 'date_debut', entete: 'Date de début', largeur: 16 },
        { cle: 'date_fin', entete: 'Date de fin', largeur: 16 },
        { cle: 'projet', entete: 'Projet associé', largeur: 30 },
        { cle: 'partenariat', entete: 'Partenariat associé', largeur: 30 },
      ],
      lignes: entites.map((convention) => ({
        reference: convention.reference,
        titre: convention.titre,
        statut: libelleStatutExport(
          convention.statut,
          estEnRetardExport(
            'CONVENTIONS',
            convention.statut,
            convention.date_fin,
            maintenant,
          ),
        ),
        date_signature: formaterDateExport(convention.date_signature),
        date_debut: formaterDateExport(convention.date_debut),
        date_fin: formaterDateExport(convention.date_fin),
        projet: convention.projet?.nom ?? '',
        partenariat: convention.partenariat?.intitule ?? '',
      })),
    };
  }
}
