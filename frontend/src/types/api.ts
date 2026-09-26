// src/types/api.ts

export type RoleUtilisateur = 'PRESIDENCE' | 'ETABLISSEMENT' | 'DECIDEUR';

export interface ReponseApi<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  errors?: string[];
  signature: string;
}

export interface Utilisateur {
  id: string;
  email: string;
  role: RoleUtilisateur;
  etablissement_id: string | null;
  etablissement_nom: string | null;
}

export interface ConnexionReponse {
  access_token: string;
  refresh_token: string;
  utilisateur: Utilisateur;
}

export interface StatistiquesPubliques {
  partenaires_actifs: number;
  projets_en_cours: number;
  conventions_signees: number;
}

export interface AccueilPublic {
  statistiques: StatistiquesPubliques;
}