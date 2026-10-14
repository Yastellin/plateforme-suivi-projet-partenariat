# Suivi technique — points a nettoyer plus tard

Fichier de suivi des dette techniques et taches differees, alimente au fil
des corrections. A traiter dans des commits de housekeeping dedies.

## Backend

- **Dette technique — Types uuid/text divergents**.
  Le fichier `backend/src/database/migrations/*-InitSchema.ts` ecrit des
  colonnes `uuid`, mais la base reelle (heritage Prisma) a ces colonnes en
  `text`. Les entites TypeORM (`Projet`, `Partenaire`, `Utilisateur`,
  `Document`, `RefreshToken`, etc.) declarent egalement `uuid` alors que la
  base est en `text`.
  Impact actuel : nul en runtime (TypeORM accepte des chaines dans une
  colonne text). Risque : une nouvelle migration produira des `ALTER TABLE`
  destructeurs, et une FK `text` -> `uuid` echouera (cas rencontre sur
  `Porteur.etablissement_id`).
  Correctif a prevoir : `commit chore(db): aligner les decorateurs sur le
  type reel text`, qui remplace tous les `type: 'uuid'` par `type: 'text'`
  dans les entites et DTOs. `@IsUUID()` reste valide pour valider le
  contenu.

- **`backend/src/partenaires/contacts/dto/contact-response.dto.ts` est vide**.
  `ContactsService` renvoie l'entite `Contact` brute (save/find) sans mapper
  vers un DTO de reponse : les colonnes internes (partenaire_id, created_at,
  updated_at) sont exposees et le contrat API unifie n'est pas garanti.
  TODO aussi present en en-tete du fichier. A remplir et a utiliser dans
  contacts.service.ts + contacts.controller.ts.

## Frontend

- **`normaliserPrenom()` est morte** dans `frontend/src/lib/normalisation.ts`
  depuis la simplification du formulaire de contact (fix Bug B, champ prenom
  fantome supprime). Plus aucun appel : candidat a la suppression.

- **`frontend/src/features/partenaires/components/ContactForm.tsx` est legacy**
  : aucun composant ne l'importe (le formulaire actif est `ContactDialog.tsx`).
  Il reste cependant compile par `tsc` via `"include": ["src"]`
  (tsconfig.app.json), d'ou son alignement minimal dans le fix Bug B.
  A supprimer dans un commit de housekeeping dedie.
