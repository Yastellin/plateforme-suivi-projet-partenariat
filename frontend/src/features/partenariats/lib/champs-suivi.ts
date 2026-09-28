// src/features/partenariats/lib/champs-suivi.ts

export type CleSuivi =
  | 'actions_realisees'
  | 'actions_en_cours'
  | 'actions_prevues'
  | 'resultats_obtenus'
  | 'difficultes_contraintes'
  | 'perspectives_recommandations';

interface ChampSuivi {
  cle: CleSuivi;
  libelle: string;
  placeholder: string;
}

export const CHAMPS_SUIVI: ChampSuivi[] = [
  { cle: 'actions_realisees', libelle: 'Actions réalisées', placeholder: 'Décrivez les actions déjà menées' },
  { cle: 'actions_en_cours', libelle: 'Actions en cours', placeholder: 'Décrivez les actions actuellement en cours' },
  { cle: 'actions_prevues', libelle: 'Actions prévues', placeholder: 'Décrivez les actions à venir' },
  { cle: 'resultats_obtenus', libelle: 'Résultats obtenus', placeholder: 'Indiquez les résultats constatés' },
  {
    cle: 'difficultes_contraintes',
    libelle: 'Difficultés et contraintes',
    placeholder: 'Indiquez les difficultés rencontrées',
  },
  {
    cle: 'perspectives_recommandations',
    libelle: 'Perspectives et recommandations',
    placeholder: 'Indiquez les perspectives et recommandations',
  },
];