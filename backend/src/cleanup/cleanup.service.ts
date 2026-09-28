import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_PORT } from '../storage/storage.port';
import type { StoragePort } from '../storage/storage.port';

// Delai de grace : on ne supprime pas un fichier de moins de 24 h,
// pour eviter de supprimer un fichier en cours d upload ou dont
// l ecriture en base est en cours.
const DELAI_GRACE_MS = 24 * 60 * 60 * 1000;

export interface ResultatNettoyage {
  examines: number;
  supprimes: number;
  conserves: number;
  erreurs: number;
  duree_ms: number;
}

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PORT) private storage: StoragePort,
  ) {}

  async nettoyerFichiersOrphelins(): Promise<ResultatNettoyage> {
    const debut = Date.now();
    const maintenant = Date.now();

    const fichiers = await this.storage.listerFichiers();

    // Recuperer toutes les URLs referencees en base
    const [documents, photos] = await Promise.all([
      this.prisma.document.findMany({ select: { url_fichier: true } }),
      this.prisma.photoPublication.findMany({ select: { url_fichier: true } }),
    ]);

    const urlsReferencees = new Set<string>([
      ...documents.map((d) => d.url_fichier),
      ...photos.map((p) => p.url_fichier),
    ]);

    let supprimes = 0;
    let conserves = 0;
    let erreurs = 0;

    for (const fichier of fichiers) {
      const age = maintenant - fichier.date_modification.getTime();

      // Fichier trop recent : on conserve par securite
      if (age < DELAI_GRACE_MS) {
        conserves++;
        continue;
      }

      // Fichier reference en base : on conserve
      if (urlsReferencees.has(fichier.url)) {
        conserves++;
        continue;
      }

      // Fichier orphelin : suppression
      try {
        await this.storage.supprimer(fichier.url);
        supprimes++;
        this.logger.warn(
          `Fichier orphelin supprime : ${fichier.url} (${fichier.taille} octets, modifie il y a ${Math.floor(age / 3600000)} h)`,
        );
      } catch (err) {
        erreurs++;
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`Echec suppression ${fichier.url} : ${message}`);
      }
    }

    const duree = Date.now() - debut;
    const resultat: ResultatNettoyage = {
      examines: fichiers.length,
      supprimes,
      conserves,
      erreurs,
      duree_ms: duree,
    };

    this.logger.log(
      `Nettoyage termine : ${resultat.examines} examines, ${resultat.supprimes} supprimes, ${resultat.conserves} conserves, ${resultat.erreurs} erreurs (${duree} ms)`,
    );

    return resultat;
  }
}