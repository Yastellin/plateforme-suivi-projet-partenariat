import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partenaire } from '../../partenaires/entities/partenaire.entity';
import { FiltresExportDto } from '../dto/filtres-export.dto';
import { PorteeExport } from '../export.enums';
import { ajouterFiltrePeriodeExport } from '../filtre-periode-export';
import { DonneesEntiteExport, ExporteurEntite } from '../exporteur.interface';
import { formaterDateExport } from '../formatage-export';
import { libelleStatutExport } from '../statuts-export';

@Injectable()
export class PartenaireExporteur implements ExporteurEntite {
  readonly portee = PorteeExport.PARTENAIRES;

  constructor(
    @InjectRepository(Partenaire)
    private readonly partenaires: Repository<Partenaire>,
  ) {}

  async construireRequete(
    filtres: FiltresExportDto,
  ): Promise<DonneesEntiteExport> {
    const requete = this.partenaires
      .createQueryBuilder('partenaire')
      .leftJoinAndSelect('partenaire.etablissement', 'etablissement')
      .where('partenaire.archive = :archive', { archive: false });

    // Le répertoire des partenaires n'a pas de date signature/début/fin ni de
    // filtre de statut : sa date de référence reste la date de création.
    ajouterFiltrePeriodeExport(
      requete,
      'partenaire.created_at',
      filtres.periode,
    );

    const entites = await requete.orderBy('partenaire.nom', 'ASC').getMany();
    return {
      portee: this.portee,
      libelle: 'Partenaires',
      nomFeuille: 'Partenaires',
      nomFichier: 'partenaires.csv',
      colonnes: [
        { cle: 'nom', entete: 'Nom', largeur: 28 },
        { cle: 'type', entete: 'Type', largeur: 20 },
        { cle: 'pays', entete: 'Pays', largeur: 20 },
        { cle: 'statut', entete: 'Statut', largeur: 18 },
        { cle: 'adresse', entete: 'Adresse', largeur: 34 },
        { cle: 'telephone', entete: 'Téléphone', largeur: 20 },
        { cle: 'email', entete: 'Courriel', largeur: 30 },
        { cle: 'site_web', entete: 'Site web', largeur: 30 },
        { cle: 'etablissement', entete: 'Établissement rattaché', largeur: 30 },
        { cle: 'strategique', entete: 'Partenaire stratégique', largeur: 22 },
        { cle: 'date_creation', entete: 'Date de création', largeur: 18 },
        { cle: 'description', entete: 'Description', largeur: 42 },
      ],
      lignes: entites.map((partenaire) => ({
        nom: partenaire.nom,
        type: partenaire.type,
        pays: partenaire.pays,
        statut: libelleStatutExport(partenaire.statut),
        adresse: partenaire.adresse ?? '',
        telephone: partenaire.telephone ?? '',
        email: partenaire.email ?? '',
        site_web: partenaire.site_web ?? '',
        etablissement: partenaire.etablissement?.nom ?? '',
        strategique: partenaire.est_strategique ? 'Oui' : 'Non',
        date_creation: formaterDateExport(partenaire.created_at),
        description: partenaire.description ?? '',
      })),
    };
  }
}
