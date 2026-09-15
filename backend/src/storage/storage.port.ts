export interface StoragePort {
  enregistrer(fichier: Express.Multer.File, dossier: string): Promise<string>;
  supprimer(urlFichier: string): Promise<void>;
}

export const STORAGE_PORT = 'STORAGE_PORT';