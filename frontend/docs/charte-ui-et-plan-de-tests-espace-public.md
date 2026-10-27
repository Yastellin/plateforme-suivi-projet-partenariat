# Charte UI et plan de tests — espace public

## 1. Décision de direction visuelle

La direction retenue est le **style institutionnel malgache**. Elle prolonge l’identité visuelle actuelle de l’Université de Fianarantsoa : une interface sobre et accueillante, le vert comme couleur institutionnelle, l’orange comme accent mesuré, et les contenus réels de l’Université au premier plan.

Le style éditorial universitaire et le style innovation et coopération ne sont pas retenus comme directions globales. Des choix éditoriaux peuvent toutefois être utilisés ponctuellement pour améliorer la lecture des actualités ou mettre en valeur les projets, sans altérer l’identité institutionnelle.

## 2. Périmètre

Cette charte s’applique aux pages publiques de la vitrine :

- Accueil : `/`
- Actualités : `/actualites` et `/actualites/:id`
- Projets : `/projets` et `/projets/:id`
- Partenariats : `/partenariats` et `/partenariats/:id`
- Établissements : `/etablissements`
- À propos : `/a-propos`
- Contact : `/contact`

L’accès « Espace interne » reste une action distincte qui mène à `/connexion`. Les pages internes authentifiées ne relèvent pas de cette charte.

## 3. Fondations visuelles

### Couleurs

Les couleurs de base reprennent les variables déjà définies dans `src/styles/vitrine.css` :

| Rôle | Valeur de référence | Usage |
|---|---|---|
| Vert institutionnel | `#367D56` | Bouton principal, liens et éléments de marque |
| Vert profond | `#1B4D34` | Titres accentués et textes sur fond clair |
| Vert pâle | `#E8F0EA` | Fonds discrets et états secondaires |
| Orange | environ `#D88A16` | Soulignement du lien actif et accents ponctuels |
| Fond de page | `#F7F7F5` | Fonds généraux |
| Surface | `#FFFFFF` | Cartes, navigation et panneaux |
| Texte secondaire | `#5F6368` | Descriptions, dates et métadonnées |
| Bordure | `#E3E4E0` | Séparateurs et limites des cartes |

Le vert est la couleur d’action principale. L’orange n’est pas utilisé comme grand aplat ni comme couleur de texte courant : il sert de repère de navigation et d’accent.

### Typographie

- Titres : **Plus Jakarta Sans**, avec une hiérarchie claire et des tailles fluides.
- Paragraphes, formulaires et navigation : **Inter**.
- Corps de texte : viser une longueur de ligne confortable (environ 60 à 70 caractères).
- Les titres doivent rester concis et décrire précisément le contenu de la page.

### Espacements et surfaces

- Conteneur centré, largeur maximale proche de `1160px`, avec marges latérales adaptatives.
- Espacement généreux entre les sections, sans créer de longues zones vides sur mobile.
- Cartes à coins modérément arrondis (environ `12px`), bordure légère et ombre discrète.
- Les ombres et animations restent secondaires et ne doivent pas nuire aux performances ni à la lisibilité.

### Images

- Afficher les images et logos dans leur intégralité, sans recadrage destructif (`object-fit: contain` dans les cadres concernés).
- Les cadres peuvent avoir des dimensions communes pour aligner les cartes, mais ne doivent pas déformer l’image.
- Garder un fond neutre derrière les images lorsque le ratio de l’image laisse apparaître de l’espace libre.
- Fournir un texte alternatif pertinent pour les images informatives ; utiliser un texte alternatif vide pour les images strictement décoratives.
- Prévoir un état de remplacement en cas d’image absente ou inaccessible.

## 4. Composants et conventions

### Navigation publique

- Ordre : Accueil, Actualités, Projets, Partenariats, Établissements, À propos, Contact.
- Le lien correspondant à la page active est indiqué par un **soulignement orange**, sans bordure ni fond encadrant.
- Les pages de détail gardent actif le lien de leur rubrique parente.
- Le bouton « Espace interne » est visuellement séparé des liens de consultation publique et mène à `/connexion`.
- Sur petit écran, utiliser un menu repliable ; il doit pouvoir être ouvert, parcouru et fermé au clavier.

### Actions

- Action principale : bouton vert plein.
- Action secondaire : bouton clair avec bordure ou contraste suffisant.
- Les liens de navigation ne doivent pas être stylés comme des boutons, sauf lorsqu’ils représentent une action principale explicite.
- Les textes de boutons indiquent le résultat de l’action (« Voir les projets », « Envoyer le message »), plutôt qu’un libellé vague (« OK »).

### Cartes

- Actualité : photo, catégorie ou rubrique, date, titre, extrait et lien vers le détail.
- Projet : nom, statut, domaine, période et établissement ou porteur, lorsque disponibles.
- Partenaire : nom, logo éventuel, type et pays.
- Toute la surface ne doit devenir cliquable que si cela reste accessible au clavier et ne contient pas de liens imbriqués.

### Filtres et formulaires

- Les filtres ont des labels visibles, des valeurs par défaut compréhensibles et un moyen de réinitialisation.
- Sur mobile, les filtres peuvent être regroupés dans un panneau ; leur ouverture, application et fermeture doivent être explicites.
- Les erreurs de formulaire sont affichées près du champ concerné et annoncées de façon accessible.
- Après envoi d’un message, afficher un état de confirmation et sa référence de suivi si elle est retournée par le service.

### États communs

Chaque page qui charge des données doit prévoir :

1. un état de chargement compréhensible ;
2. un état d’erreur avec une action de nouvelle tentative lorsque cela est possible ;
3. un état vide avec une explication et, si pertinent, une action de réinitialisation ;
4. un état normal avec les informations accessibles et correctement hiérarchisées.

## 5. Parcours utilisateur prioritaires

### Parcours 1 — Découvrir un projet

**Chemin nominal :** Accueil → Projets (`/projets`) → recherche ou filtres → détail (`/projets/:id`) → liens associés vers partenaires ou actualité.

**Critères de réussite :**
- La navigation « Projets » ouvre la liste publique.
- La recherche et les filtres modifient les résultats de façon cohérente.
- Une carte ouvre le bon détail ; un fil d’Ariane permet de revenir à la liste.
- Le détail présente les informations publiques disponibles et n’expose pas de données internes.

### Parcours 2 — Un partenaire potentiel cherche à collaborer

**Chemin nominal :** Accueil → Partenariats (`/partenariats`) → recherche ou filtres → détail (`/partenariats/:id`) → Contact (`/contact`) → sélection du destinataire → envoi → confirmation.

**Critères de réussite :**
- Les filtres disponibles sont compréhensibles et réinitialisables.
- Le détail identifie clairement le partenaire et les informations publiques disponibles.
- Le formulaire indique les champs obligatoires, valide les données et associe le bon destinataire.
- La confirmation n’est montrée qu’après succès de l’envoi ; la référence est affichée si l’API en renvoie une.

### Parcours 3 — Lire une actualité

**Chemin nominal :** Accueil ou Actualités (`/actualites`) → publication (`/actualites/:id`) → galerie et contenu → lien éventuel vers un projet ou partenaire associé.

**Critères de réussite :**
- Une actualité est identifiable par son titre, sa date et son image lorsqu’elle existe.
- Les photos sont affichées sans découpe du contenu et la galerie reste utilisable au clavier.
- Le retour vers la liste est disponible.
- Les liens vers les contenus associés ouvrent la bonne rubrique.

### Parcours 4 — Trouver un établissement

**Chemin nominal :** Accueil → Établissements (`/etablissements`) → repérer un établissement → consulter ses informations publiques ou ses contenus associés → Contact (`/contact`) si nécessaire.

**Critères de réussite :**
- Chaque établissement est identifiable par son nom et son sigle lorsqu’ils sont disponibles.
- Les logos conservent leur ratio et disposent d’un texte alternatif pertinent.
- L’utilisateur trouve une voie de contact sans devoir revenir au début du site.

### Parcours 5 — Accéder à l’espace interne

**Chemin nominal :** n’importe quelle page publique → « Espace interne » → Connexion (`/connexion`).

**Critères de réussite :**
- Le contrôle se distingue des rubriques publiques et sa destination est explicite.
- Il reste accessible au clavier et utilisable sur mobile.
- Une personne non connectée peut revenir à l’espace public sans perdre le contexte de navigation.

## 6. Plan de tests

### Tests automatisés de navigation

Les parcours ci-dessus doivent être couverts par des tests navigateur sur des données contrôlées. Chaque scénario vérifie au minimum :

- chargement de la page de départ et présence de son titre principal ;
- navigation par les liens visibles, sans URL supposée non déclarée ;
- présence du lien actif et de sa rubrique parente sur les pages de détail ;
- ouverture du détail correspondant à la carte choisie ;
- comportement des filtres, de la recherche et de la réinitialisation lorsqu’ils existent ;
- affichage des états vides, d’erreur et de confirmation pertinents ;
- absence de fuite de données réservées à l’espace interne.

| Scénario | Pages principales | Vérification spécifique |
|---|---|---|
| Découverte projet | `/` → `/projets` → `/projets/:id` | Filtre/recherche, détail et retour |
| Collaboration | `/partenariats` → `/partenariats/:id` → `/contact` | Destinataire, validation, envoi et confirmation |
| Lecture actualité | `/actualites` → `/actualites/:id` | Galerie, retour et liens associés |
| Recherche établissement | `/etablissements` → `/contact` | Identification, ratio du logo et voie de contact |
| Accès interne | page publique → `/connexion` | Lien séparé, destination et retour public |

Les tests navigateur doivent utiliser des réponses API déterministes. Ils ne doivent pas dépendre de données de production ni d’un accès Internet externe.

### Vérification manuelle — mobile

Faire au minimum une vérification sur une largeur de **360 px** et une largeur intermédiaire de **768 px** :

- aucun défilement horizontal involontaire ;
- menu ouvrable, liens lisibles et fermeture après navigation ;
- cartes et filtres adaptés à la largeur ;
- formulaires utilisables sans zoom excessif ;
- photos entièrement visibles et actions non masquées ;
- tailles de texte et zones tactiles confortables.

### Vérification manuelle — clavier et accessibilité

Parcourir les cinq parcours sans souris :

- `Tab` et `Maj+Tab` suivent un ordre logique ;
- le focus est toujours visible ;
- le lien « Aller au contenu » est présent et fonctionnel ;
- menus, filtres, galerie et formulaires sont utilisables avec le clavier ;
- les boutons ont des noms accessibles ;
- les préférences de réduction des animations sont respectées ;
- les erreurs et confirmations de formulaire sont perceptibles sans dépendre uniquement de la couleur.

## 7. Conditions de validation

La charte est considérée respectée si :

- l’identité vert institutionnel / accent orange est cohérente sur toutes les pages publiques ;
- le lien actif est souligné en orange, sans bordure ni fond d’onglet ;
- les composants partagés ont les mêmes états et comportements dans chaque rubrique ;
- les cinq parcours automatisés passent avec des réponses API contrôlées ;
- les cinq parcours ont été vérifiés manuellement sur mobile et au clavier ;
- les états de chargement, erreur et absence de résultat sont couverts ;
- les photos et logos gardent leurs proportions et leur contenu intégral.

## 8. Sources dans le frontend

- Styles et tokens publics : `src/styles/vitrine.css`
- Navigation : `src/components/layout/TopbarPublique.tsx`
- Accueil : `src/features/espace-public/pages/AccueilPage.tsx` et `src/features/espace-public/components/HeroAccueil.tsx`
- Cartes publiques : `src/features/espace-public/components/CartesPubliques.tsx`
- Formulaire public : `src/features/espace-public/components/FormulaireContact.tsx`
- Pages et routes : `src/features/espace-public/pages/` et `src/router.tsx`
