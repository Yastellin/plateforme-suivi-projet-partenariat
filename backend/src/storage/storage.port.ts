export interface FichierStocke {
  url: string;
  cheminComplet: string;
  taille: number;
  date_modification: Date;
}

export interface StoragePort {
  enregistrer(fichier: Express.Multer.File, dossier: string): Promise<string>;
  supprimer(urlFichier: string): Promise<void>;
  listerFichiers(): Promise<FichierStocke[]>;
}

export const STORAGE_PORT = 'STORAGE_PORT';
