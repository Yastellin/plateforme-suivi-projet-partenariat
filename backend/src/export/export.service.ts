import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Convention } from '../conventions/entities/convention.entity';
import { Projet } from '../projets/entities/projet.entity';
import { EXCEL_GENERATOR_PORT } from './excel-generator.port';
import type { ExcelGeneratorPort } from './excel-generator.port';
import { PDF_GENERATOR_PORT } from './pdf-generator.port';
import type { PdfGeneratorPort } from './pdf-generator.port';

export type FormatExport = 'pdf' | 'xlsx';

export interface ResultatExport {
  buffer: Buffer;
  nomFichier: string;
  mimeType: string;
}

const MIME_PDF = 'application/pdf';
const MIME_XLSX =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    @InjectRepository(Convention)
    private conventionRepo: Repository<Convention>,
    @Inject(PDF_GENERATOR_PORT) private pdfGenerator: PdfGeneratorPort,
    @Inject(EXCEL_GENERATOR_PORT) private excelGenerator: ExcelGeneratorPort,
  ) {}

  async exporterProjets(
    format: FormatExport,
    etablissementId?: string,
  ): Promise<ResultatExport> {
    this.verifierFormat(format);
    const projets = await this.projetRepo.find({
      where: etablissementId ? { etablissement_id: etablissementId } : {},
      relations: { etablissement: true },
      order: { nom: 'ASC' },
    });

    const colonnes = [
      { header: 'Nom', key: 'nom' },
      { header: 'Type', key: 'type' },
      { header: 'Statut', key: 'statut' },
      { header: 'Date debut', key: 'dateDebut' },
      { header: 'Date fin', key: 'dateFin' },
      { header: 'Budget', key: 'budget' },
      { header: 'Etablissement', key: 'etablissement' },
    ];
    const lignes = projets.map((projet) => ({
      nom: projet.nom,
      type: projet.type,
      statut: projet.statut,
      dateDebut: this.formaterDate(projet.date_debut),
      dateFin: this.formaterDate(projet.date_fin_prevue),
      budget: this.formaterMontant(projet.budget),
      etablissement: projet.etablissement?.nom ?? '',
    }));

    const date = this.dateFichier();
    const buffer =
      format === 'pdf'
        ? await this.pdfGenerator.genererTableau(
            'Export des projets',
            colonnes,
            lignes,
          )
        : await this.excelGenerator.genererTableau('Projets', colonnes, lignes);
    return {
      buffer,
      nomFichier: `projets_${date}.${format}`,
      mimeType: format === 'pdf' ? MIME_PDF : MIME_XLSX,
    };
  }

  async exporterConventions(
    format: FormatExport,
    etablissementId?: string,
  ): Promise<ResultatExport> {
    this.verifierFormat(format);
    const query = this.conventionRepo
      .createQueryBuilder('convention')
      .leftJoinAndSelect('convention.projet', 'projet')
      .leftJoinAndSelect('projet.etablissement', 'etablissement')
      .leftJoinAndSelect('convention.partenariat', 'partenariat')
      .leftJoin('partenariat.etablissements', 'partenariatEtablissement')
      .orderBy('convention.reference', 'ASC');

    if (etablissementId) {
      query.where(
        '(projet.etablissement_id = :etablissementId OR partenariatEtablissement.etablissement_id = :etablissementId)',
        { etablissementId },
      );
    }

    const conventions = await query.distinct(true).getMany();
    const colonnes = [
      { header: 'Reference', key: 'reference' },
      { header: 'Titre', key: 'titre' },
      { header: 'Statut', key: 'statut' },
      { header: 'Date debut', key: 'dateDebut' },
      { header: 'Date fin', key: 'dateFin' },
      { header: 'Partenariat', key: 'partenariat' },
    ];
    const lignes = conventions.map((convention) => ({
      reference: convention.reference,
      titre: convention.titre,
      statut: convention.statut,
      dateDebut: this.formaterDate(convention.date_debut),
      dateFin: this.formaterDate(convention.date_fin),
      partenariat: convention.partenariat?.intitule ?? '',
    }));

    const date = this.dateFichier();
    const buffer =
      format === 'pdf'
        ? await this.pdfGenerator.genererTableau(
            'Export des conventions',
            colonnes,
            lignes,
          )
        : await this.excelGenerator.genererTableau(
            'Conventions',
            colonnes,
            lignes,
          );
    return {
      buffer,
      nomFichier: `conventions_${date}.${format}`,
      mimeType: format === 'pdf' ? MIME_PDF : MIME_XLSX,
    };
  }

  private verifierFormat(format: FormatExport): void {
    if (format !== 'pdf' && format !== 'xlsx') {
      throw new BadRequestException('Le format doit être « pdf » ou « xlsx ».');
    }
  }

  private formaterDate(date: Date | null): string {
    if (!date) {
      return '';
    }
    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0');
    return `${jour}/${mois}/${date.getFullYear()}`;
  }

  private formaterMontant(montant: number | null): string {
    if (montant === null) {
      return '';
    }
    return Number(montant).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private dateFichier(): string {
    const maintenant = new Date();
    const annee = maintenant.getFullYear();
    const mois = String(maintenant.getMonth() + 1).padStart(2, '0');
    const jour = String(maintenant.getDate()).padStart(2, '0');
    return `${annee}-${mois}-${jour}`;
  }
}
