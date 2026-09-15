import { Injectable } from '@nestjs/common';
import { StoragePort } from './storage.port';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LocalStorageAdapter implements StoragePort {
  private readonly baseDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async enregistrer(fichier: Express.Multer.File, dossier: string): Promise<string> {
    const dossierComplet = path.join(this.baseDir, dossier);
    if (!fs.existsSync(dossierComplet)) {
      fs.mkdirSync(dossierComplet, { recursive: true });
    }

    const extension = path.extname(fichier.originalname);
    const nomUnique = `${uuidv4()}${extension}`;
    const cheminComplet = path.join(dossierComplet, nomUnique);

    fs.writeFileSync(cheminComplet, fichier.buffer);

    return `/uploads/${dossier}/${nomUnique}`;
  }

  async supprimer(urlFichier: string): Promise<void> {
    const cheminComplet = path.join(this.baseDir, urlFichier.replace('/uploads/', ''));
    if (fs.existsSync(cheminComplet)) {
      fs.unlinkSync(cheminComplet);
    }
  }
}