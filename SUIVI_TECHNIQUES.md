# Suivi technique — points a nettoyer plus tard

Fichier de suivi des dette techniques et taches differees, alimente au fil
des corrections. A traiter dans des commits de housekeeping dedies.

## Backend

- **`backend/src/partenaires/contacts/dto/contact-response.dto.ts` est vide**.
  `ContactsService` renvoie l'entite `Contact` brute (save/find) sans mapper
  vers un DTO de reponse : les colonnes internes (partenaire_id, created_at,
  updated_at) sont exposees et le contrat API unifie n'est pas garanti.
  TODO aussi present en en-tete du fichier. A remplir et a utiliser dans
  contacts.service.ts + contacts.controller.ts.

## Espace public

- **Image de couverture de démonstration** : le seed utilise temporairement une
  URL Unsplash pour sa publication publique de démonstration. La remplacer par
  une image locale institutionnelle avant la soutenance.

## Frontend

- **`normaliserPrenom()` est morte** dans `frontend/src/lib/normalisation.ts`
  depuis la simplification du formulaire de contact (fix Bug B, champ prenom
  fantome supprime). Plus aucun appel : candidat a la suppression.

- **`frontend/src/features/partenaires/components/ContactForm.tsx` est legacy**
  : aucun composant ne l'importe (le formulaire actif est `ContactDialog.tsx`).
  Il reste cependant compile par `tsc` via `"include": ["src"]`
  (tsconfig.app.json), d'ou son alignement minimal dans le fix Bug B.
  A supprimer dans un commit de housekeeping dedie.
