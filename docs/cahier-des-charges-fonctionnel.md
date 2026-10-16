# PLATEFORME DE GESTION ET DE SUIVI DES PROJETS ET PARTENARIATS DE L'UNIVERSITÉ DE FIANARANTSOA

## Cahier des charges fonctionnel

**Version 5 — expression des besoins de la maîtrise d'ouvrage**

---

## Fiche du document

| Élément | Valeur |
|---|---|
| Intitulé | Cahier des charges fonctionnel de la plateforme de gestion et de suivi des projets et partenariats |
| Nature du document | Expression des besoins fonctionnels : ce que le système doit permettre aux utilisateurs de faire |
| Maître d'ouvrage | Université de Fianarantsoa — équipe Projet et Partenariat (Présidence) |
| Destinataires | Équipe Projet et Partenariat (validation), maîtrise d'œuvre (conception et réalisation) |
| Version précédente | Cahier des charges version 4 (fichier `Cahier des de charges.pdf`, 14 pages, du 16/10/2026) |
| Version courante | Version 5 fonctionnelle |
| Sources | (1) le cahier des charges v4 fourni par la maîtrise d'ouvrage ; (2) les échanges d'analyse avec l'équipe, restitution technique consignée dans le document d'analyse joint (`cahier-des-charges-v5.md`) |
| Contenu du document | Périmètre, acteurs et droits, besoins fonctionnels détaillés et vérifiables, règles de gestion RG01 à RG44, parcours utilisateurs, écrans attendus, exigences non fonctionnelles, scénarios de recette, points à trancher |
| Ce que ce document ne contient pas | Choix techniques, description du logiciel existant, plan de développement, estimation de charge, modèle de données physique. Ces éléments relèvent du document d'analyse technique joint |
| Règle appliquée | Aucun besoin non exprimé par la maîtrise d'ouvrage n'est inventé. Lorsqu'une information manque dans le document v4, elle n'est pas supposée : le besoin est écrit avec la mention **à préciser** et repris au chapitre 10 |
| Date de rédaction | 16 octobre 2026 |

### Comment lire ce document

Chaque besoin fonctionnel porte une référence de la forme **BF-XXX-nn** :

- les trois lettres désignent le domaine (par exemple `PAR` pour les partenaires) ;
- le numéro final identifie le besoin dans ce domaine.

Chaque besoin est accompagné des **règles de gestion** de la version 4 qui le gouvernent (RG01 à RG44) et d'une **vérification attendue**, formulée de manière à pouvoir être constatée pendant la recette, sans connaissance technique.

Deux mots sont employés dans leur sens habituel des cahiers des charges :

| Terme | Sens retenu |
|---|---|
| **doit** | Le besoin est obligatoire : son absence empêche la réception de la fonctionnalité concernée |
| **peut** | Le besoin est exprimé comme une possibilité à la discrétion de l'équipe Projet et Partenariat ; son déclenchement ou ses seuils sont à confirmer (renvoi au chapitre 10) |
| **à préciser** | Le document v4 ne tranche pas la question ; la décision revient à la maîtrise d'ouvrage |

---

## Sommaire

<!-- TOC -->

---

# 1. Objet, contexte et finalité

## 1.1. Contexte

*(Repris du cahier des charges version 4, section 1.1.)*

L'Université de Fianarantsoa entretient différentes relations de partenariat avec des entreprises, des institutions, des organismes, des universités ainsi que d'autres acteurs externes. Ces collaborations peuvent conduire à la mise en œuvre de projets dans différents domaines, notamment la formation, la recherche, l'innovation, le développement et la coopération institutionnelle.

Les établissements de l'Université participent également à ces collaborations et peuvent disposer de leurs propres partenaires, partenariats et projets. Afin que ces informations puissent être connues au niveau central, chaque établissement doit pouvoir ajouter les informations relatives à ses propres projets et partenariats dans une plateforme commune.

Au niveau de la Présidence, l'équipe Projet et Partenariat joue un rôle central dans le suivi et la gestion globale des informations relatives aux collaborations de l'Université. Elle doit pouvoir connaître les partenaires des différents établissements, suivre les projets en cours, consulter les informations relatives aux bailleurs, bénéficiaires, porteurs et sites concernés, gérer les documents associés et conserver les conventions signées dans des archives numériques.

L'équipe assure également le suivi des cotutelles de thèses avec les universités partenaires, ainsi que la production d'une synthèse nationale de l'activité de coopération de l'Université.

Le présent projet consiste à concevoir et développer une plateforme web centralisée destinée à faciliter la gestion, le suivi, la consultation et l'archivage de ces informations.

## 1.2. Problématique

*(Repris du cahier des charges version 4, section 1.2.)*

Comment concevoir et mettre en place une plateforme web simple, centralisée et adaptée aux besoins de l'Université de Fianarantsoa, permettant aux établissements d'ajouter leurs propres projets et partenariats, tout en permettant à l'équipe Projet et Partenariat de la Présidence d'assurer la gestion globale, le suivi, la consultation et l'archivage des informations ?

## 1.3. Objectif général

*(Repris du cahier des charges version 4, section 2.1.)*

Mettre à disposition de l'Université une plateforme web permettant de centraliser, gérer, suivre et archiver les informations relatives aux projets et partenariats de l'Université de Fianarantsoa et de ses établissements, en remplaçant progressivement le suivi actuellement réalisé sous Excel.

## 1.4. Résultats attendus

*(Repris du cahier des charges version 4, section 2.2, présenté sous forme de résultats constatables.)*

| Réf. | Résultat attendu à la mise en service |
|---|---|
| RE-01 | Les informations relatives aux partenaires, aux partenariats, aux cotutelles de thèses et aux projets sont enregistrées et consultables dans une base unique, partagée par la Présidence et les établissements |
| RE-02 | Les informations propres à chaque projet sont conservées : nom, intitulé officiel, type, domaine, durée, budget total, porteur, bailleur(s), bénéficiaires, sites concernés |
| RE-03 | Les activités d'un projet et leur chronogramme mensuel et trimestriel en nombre de jours sont suivis dans la plateforme, ainsi que les documents associés (termes de référence, descriptions de projet, conventions) et les conventions signées archivées |
| RE-04 | L'équipe Projet et Partenariat dispose d'une vision globale des informations et d'une synthèse annuelle par établissement calculée automatiquement |
| RE-05 | Le Décideur dispose d'une vue de consultation et les visiteurs d'un accès aux informations publiques |
| RE-06 | Les établissements disposent d'un espace de gestion minimal et séparé, leur permettant d'ajouter et de mettre à jour leurs propres projets et partenariats sans compétence technique |
| RE-07 | Un système de notifications informe les utilisateurs concernés : ajout d'un nouveau projet ou partenariat par un établissement, conventions approchant de leur expiration ou expirées, activités et projets en retard |
| RE-08 | Le suivi annuel réalisé manuellement dans des fichiers Excel et dans le fichier `Synthese_national` est remplacé par la plateforme, sans perte d'information |

## 1.5. Finalité du présent document

Ce document constitue la référence contractuelle des besoins fonctionnels. Il sert à trois usages :

1. **Validation par la maîtrise d'ouvrage** : chaque besoin du chapitre 4 et chaque règle du chapitre 5 sont vérifiables un par un ; les points non tranchés sont listés au chapitre 10.
2. **Base de conception pour la maîtrise d'œuvre** : le document décrit ce que le système doit permettre, sans imposer de solution technique.
3. **Base de recette** : les scénarios du chapitre 9 permettent de prononcer la réception fonctionnelle de la plateforme.

---

# 2. Périmètre

## 2.1. Dans le périmètre

| Domaine | Contenu attendu |
|---|---|
| Gestion des partenaires et des contacts | Enregistrement, mise à jour, recherche avant création |
| Gestion des partenariats | Collaboration entre établissements et partenaires, avec ses champs de suivi narratifs |
| Gestion des cotutelles de thèses | Suivi des cotutelles et co-encadrements avec les universités partenaires |
| Gestion des projets | Projet autonome ou rattaché à un partenariat, avec ses porteurs, bailleurs, bénéficiaires, sites, activités et documents |
| Suivi de l'avancement et chronogramme | Activités, état terminé, avancement calculé, suivi en nombre de jours par mois et par trimestre |
| Gestion des documents | Termes de référence, descriptions de projet, conventions, avec historique des versions |
| Gestion des conventions | Cycle de vie, circuit de traitement avant signature, suivi de la validité, archivage |
| Archivage | Archivage des éléments non actifs et des anciennes versions de documents, consultation des archives |
| Publications | Contenu de communication destiné à l'espace public, avec photos |
| Synthèse annuelle | Compteurs par établissement calculés automatiquement et compléments narratifs saisis par l'équipe |
| Tableau de bord | Indicateurs adaptés à chaque rôle interne |
| Recherche et filtrage | Recherche rapide et filtres par critères sur les principaux domaines |
| Notifications | Alertes issues des actions des utilisateurs et des contrôles périodiques |
| Espace public | Vitrine accessible sans compte : accueil, à propos, établissements, partenaires, projets et partenariats, contact |
| Espace de gestion de l'établissement | Espace dédié et minimal, cloisonné par établissement |

## 2.2. Hors périmètre

| Élément exclu | Motif exprimé par la maîtrise d'ouvrage |
|---|---|
| Gestion administrative des établissements | Les établissements sont des structures existantes de l'Université (section 5.2 du document v4, règle RG33) |
| Création et administration des comptes d'accès | Relevant de l'administration technique de la plateforme, hors du périmètre fonctionnel de l'équipe Projet et Partenariat (section 4 du document v4) |
| Saisie des données par les visiteurs | L'intégration de la saisie établissement dans les pages publiques a été envisagée puis écartée : elle aurait mélangé les données validées et non validées et compliqué la distinction des droits d'affichage (section 3.2 du document v4) |
| Facturation, comptabilité, gestion budgétaire | Non exprimé dans le document v4 ; le budget d'un projet est une information descriptive, non un module de gestion financière |
| Messagerie interne entre utilisateurs | Non exprimé dans le document v4 ; seules les notifications sont prévues |

## 2.3. Contraintes de périmètre et hypothèses

| Réf. | Contrainte ou hypothèse |
|---|---|
| CP-01 | La plateforme est une application web accessible depuis un navigateur, pour un usage interne (Présidence, Établissements, Décideur) et une partie publique |
| CP-02 | L'interface et les échanges sont rédigés en français |
| CP-03 | Les utilisateurs internes détiennent chacun un compte rattaché à un rôle : Présidence, Établissement ou Décideur |
| CP-04 | Le suivi actuel sous Excel (fichier `Partenaires_Universites` et fichier `Synthese_national`) constitue la référence des informations à reprendre |
| CP-05 | Le circuit de traitement d'une convention avant signature se déroule hors de la plateforme ; seule l'étape courante est enregistrée et mise à jour manuellement (règle RG22) — modalité exacte à confirmer, voir F21 au chapitre 10 |
| CP-06 | Le volume d'utilisateurs internes reste limité (une équipe à la Présidence, un compte par établissement, un ou plusieurs Décideurs) |
| CP-07 | Aucun échange automatique avec un autre système d'information de l'Université n'est demandé dans le document v4 |

---

# 3. Acteurs, rôles et droits

## 3.1. Les quatre catégories d'acteurs

*(Repris du cahier des charges version 4, section 3.)*

| Acteur | Rôle |
|---|---|
| **Équipe Projet et Partenariat (Présidence)** | Principal gestionnaire fonctionnel de la plateforme. Dispose d'une vision globale et gère les partenaires, partenariats, cotutelles de thèses, projets, conventions, documents, archives et publications. Produit la synthèse annuelle de l'activité de coopération de l'Université |
| **Établissement** | Dispose d'un compte unique et d'un espace de gestion minimal, séparé de l'espace public, dédié à l'ajout et à la mise à jour de ses propres partenaires, partenariats et projets. Ne peut consulter ni modifier les données d'un autre établissement |
| **Décideur** | Par exemple le Président de l'Université. Dispose d'une vue globale du système : consultation des indicateurs agrégés et du détail des fiches, en lecture seule. N'est pas chargé des opérations courantes de gestion |
| **Visiteur** | Utilisateur externe sans compte, pouvant consulter uniquement les informations que l'Université a choisi de rendre publiques |

## 3.2. Comptes et authentification

| Réf. | Besoin | Règles |
|---|---|---|
| BF-AUT-01 | Le système authentifie les utilisateurs internes par identifiant et mot de passe. | RG01, RG02, RG03 |
| BF-AUT-02 | Après connexion, le système détermine automatiquement le rôle du compte et oriente l'utilisateur vers l'espace correspondant à son rôle. | Section 4 du document v4 |
| BF-AUT-03 | L'équipe Projet et Partenariat dispose d'un compte unique correspondant à la Présidence ; chaque établissement dispose d'un compte unique associé à un seul établissement ; un ou plusieurs comptes Décideur peuvent exister, sans rattachement à un établissement. | RG01, RG02, RG03 |
| BF-AUT-04 | Le visiteur accède aux informations publiques sans compte. | RG04 |
| BF-AUT-05 | *(à préciser)* Les modalités de renouvellement ou de récupération d'un mot de passe par un utilisateur ne sont pas traitées dans le document v4 ; le besoin reste à définir. | Voir F15 au chapitre 10 |

## 3.3. Droits par fonctionnalité et par acteur

*(Reprise du tableau de répartition de la version 4, section 12, complété des besoins du chapitre 4.)*

| Fonctionnalité | Présidence | Établissement | Décideur | Visiteur |
|---|---|---|---|---|
| Authentification | Oui | Oui | Oui | — |
| Partenaires et partenariats | Tous, gestion complète | Les siens, dans son espace dédié | Consultation | Publics uniquement |
| Cotutelles de thèses | Gestion complète | — | Consultation | — |
| Projets | Tous, gestion complète | Les siens, dans son espace dédié | Consultation | Publiés uniquement |
| Activités, avancement, chronogramme | Tous | Les siens | Consultation | — |
| Conventions et circuit de traitement | Gestion complète | Les siennes | Consultation | — |
| Documents | Gestion complète | Les siens | — | — |
| Archives | Toutes | Les siennes | — | — |
| Publications | Gestion complète | Les siennes | Consultation | Publiées uniquement |
| Synthèse annuelle | Génération et complément narratif | — | Consultation | — |
| Recherche et filtrage | Oui | Ses données | Oui | Données publiques |
| Tableau de bord | Global | Son établissement | Global, détail en lecture seule | — |
| Notifications | Oui | Ses données | — | — |
| Espace public | — | — | — | Accès complet |

## 3.4. Règles d'accès et de cloisonnement

| Réf. | Règle fonctionnelle | Règles de gestion |
|---|---|---|
| BF-ACC-01 | Un établissement ne peut ni consulter ni modifier les informations d'un autre établissement. | RG05, RG06 |
| BF-ACC-02 | Les informations créées par un établissement sont automatiquement rattachées à cet établissement, sans saisie par l'utilisateur, afin d'éviter toute erreur de rattachement. | RG06 |
| BF-ACC-03 | L'équipe Projet et Partenariat dispose d'une vision globale de toutes les informations enregistrées, quel que soit l'établissement. | RG07 |
| BF-ACC-04 | Le Décideur n'a aucun droit de création, de modification ni de suppression : son accès est strictement consultatif. | RG32 |
| BF-ACC-05 | Les informations publiques sont séparées des informations internes ou confidentielles : le visiteur n'accède qu'à ce que l'Université a choisi de publier. | RG30, RG31 |

---

# 4. Besoins fonctionnels

Le chapitre suit le déroulé du métier : d'abord les structures et les acteurs (établissements, espace de gestion), puis les objets gérés (partenaires, partenariats, cotutelles, projets), puis le suivi (activités, documents, conventions, archivage), puis la diffusion (publications, recherche, tableaux de bord, synthèse, notifications, espace public).

## 4.1. Établissements

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-ETA-01 | Les établissements sont des structures déjà existantes de l'Université ; leur gestion administrative ne fait pas partie du périmètre de l'équipe Projet et Partenariat. Le système les met à disposition pour le rattachement des partenaires, partenariats et projets. | RG33 | Aucun écran de création, de modification ou de suppression d'établissement n'est attendu |
| BF-ETA-02 | Chaque établissement est décrit par un nom, un sigle éventuel, un logo et une description. | RG27 | Les fiches et listes affichent le nom, le sigle et le logo de l'établissement |
| BF-ETA-03 | Le rattachement d'un partenaire, d'un partenariat ou d'un projet à un établissement conditionne la visibilité et les droits de consultation et de modification. | RG05, RG06, RG16, RG33 | Un utilisateur d'établissement ne voit que les éléments rattachés à son établissement |
| BF-ETA-04 | *(à préciser)* Le document v4 ne précise pas qui alimente et met à jour la liste des établissements (nom, sigle, logo, description), ni selon quelle procédure administrative. | — | Voir F16 au chapitre 10 |

## 4.2. Espace de gestion de l'établissement

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-ESP-01 | L'établissement authentifié dispose d'un espace dédié et minimal, distinct de l'espace public, organisé autour de deux besoins : consulter la liste de ses propres partenaires, partenariats et projets, et en ajouter ou en modifier. | RG05, section 5.3 du document v4 | Depuis son espace, l'établissement accède à ses listes et à un formulaire d'ajout pour chacun des trois domaines |
| BF-ESP-02 | Les informations créées dans cet espace sont automatiquement rattachées à l'établissement du compte connecté, sans que l'utilisateur ait à le préciser. | RG06 | Aucun champ « établissement » n'est demandé à l'utilisateur ; les éléments créés apparaissent dans ses listes |
| BF-ESP-03 | Un établissement ne peut ni consulter ni modifier les informations d'un autre établissement. | RG05 | Toute tentative d'accès aux données d'un autre établissement est refusée |
| BF-ESP-04 | L'espace de gestion ne demande aucune compétence technique : les relations multiples entre entités (associations) restent invisibles pour l'utilisateur, qui sélectionne simplement les éléments concernés dans une liste. | Section 11.1 du document v4 | Pour associer plusieurs partenaires, bénéficiaires ou sites, l'utilisateur coche des éléments dans une liste ; aucune notion d'association ou de table intermédiaire ne lui est présentée |
| BF-ESP-05 | L'espace public et l'espace de gestion sont nettement séparés : la saisie de l'établissement n'est pas intégrée aux pages publiques. | Section 3.2 du document v4 | Les pages publiques n'exposent aucun formulaire de saisie réservé aux établissements |

## 4.3. Partenaires et contacts

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-PAR-01 | Un établissement peut enregistrer ses propres partenaires et mettre à jour leurs informations ; l'équipe Projet et Partenariat gère l'ensemble des partenaires. | RG05, RG07 | Un partenaire créé par un établissement apparaît dans ses listes ; la Présidence le voit dans la liste globale |
| BF-PAR-02 | Une recherche de partenaire existant est proposée avant toute création, afin d'éviter les doublons. | Section 5.4 du document v4 | Avant la création, une recherche par nom est disponible et affiche les partenaires déjà enregistrés |
| BF-PAR-03 | Un partenaire est caractérisé par : nom, logo, type, pays, adresse, coordonnées, site web éventuel, description, statut, visibilité (public ou privé) et indicateur « partenaire stratégique ». | RG27 | Chaque caractéristique figure sur la fiche du partenaire et les champs attendus sont saisissables |
| BF-PAR-04 | L'indicateur « partenaire stratégique » est utilisé par la synthèse annuelle. | Section 5.4 du document v4, RG44 | Un partenaire désigné stratégique peut être repris dans la synthèse d'un établissement |
| BF-PAR-05 | La visibilité d'un partenaire détermine son affichage dans l'espace public : un partenaire de visibilité publique peut être présenté aux visiteurs, un partenaire privé n'est pas publié. | RG31 | Seuls les partenaires marqués publics apparaissent dans la rubrique « Partenaires » de l'espace public |
| BF-PAR-06 | Chaque partenaire peut être associé à un ou plusieurs contacts : nom, fonction, e-mail, téléphone. | RG28 | Plusieurs contacts peuvent être enregistrés pour un même partenaire |
| BF-PAR-07 | Un contact est rattaché à un seul partenaire. | RG28 | Un contact ne peut pas être partagé entre deux partenaires |
| BF-PAR-08 | Un partenaire est rattaché à un établissement et peut participer à plusieurs partenariats, cotutelles de thèses et projets. | RG16 | Le même partenaire est sélectionnable dans plusieurs partenariats, plusieurs cotutelles et plusieurs projets |
| BF-PAR-09 | *(à préciser)* Le document v4 n'indique pas si deux établissements peuvent enregistrer chacun une fiche portant le même nom de partenaire, ni si l'unicité doit être appréciée au niveau de l'Université. | — | Voir F5 au chapitre 10 |
| BF-PAR-10 | *(à préciser)* La liste des valeurs possibles du statut d'un partenaire n'est pas donnée dans le document v4. | — | Voir F17 au chapitre 10 |

## 4.4. Partenariats

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-PTR-01 | Le partenariat est une entité distincte du partenaire : il représente une relation de collaboration entre un ou plusieurs établissements de l'Université et un ou plusieurs partenaires, et peut regrouper plusieurs projets. | RG17, RG18 | Un partenariat est créé en sélectionnant plusieurs établissements et plusieurs partenaires |
| BF-PTR-02 | Un partenariat comporte : un intitulé, un objet, un domaine de collaboration, une date de début, une date de fin, un statut, un ou plusieurs établissements concernés et un ou plusieurs partenaires concernés. | Section 5.5 du document v4 | Tous ces éléments figurent sur la fiche du partenariat |
| BF-PTR-03 | Un partenariat comporte six champs de suivi narratif renseignés librement par l'équipe : actions déjà réalisées, actions en cours, actions prévues, résultats obtenus, difficultés ou contraintes rencontrées, perspectives ou recommandations. | Section 5.5 du document v4 | Les six champs sont saisissables et affichés sur la fiche du partenariat |
| BF-PTR-04 | Ces champs narratifs sont des textes rédigés par l'équipe ; ils ne sont pas des statuts calculés à partir des projets. | Section 5.5 du document v4 | La saisie libre est possible ; aucun contenu automatique ne remplace le texte de l'équipe |
| BF-PTR-05 | La gestion des partenaires et des partenariats est regroupée dans une même interface : l'utilisateur sélectionne ou ajoute d'abord les partenaires concernés, puis renseigne les informations du partenariat. | Section 5.5 du document v4, section 11.1 | Un seul parcours permet d'ajouter un partenaire puis de créer le partenariat correspondant |
| BF-PTR-06 | Un partenariat peut comporter plusieurs projets ; un projet n'est rattaché qu'à un seul partenariat au plus, ou à aucun. | RG18 | La fiche d'un partenariat liste ses projets ; un projet ne peut référencer qu'un seul partenariat |
| BF-PTR-07 | Un partenariat peut concerner un ou plusieurs établissements et un ou plusieurs partenaires. | RG17 | La sélection multiple d'établissements et de partenaires est possible à la création |
| BF-PTR-08 | *(à préciser)* Le document v4 ne donne pas la liste des statuts d'un partenariat, ni les règles de passage d'un statut à un autre, ni qui peut les modifier. | — | Voir F17 au chapitre 10 |
| BF-PTR-09 | *(à préciser)* Le document v4 ne précise pas si les établissements et les partenaires associés à un partenariat peuvent être modifiés après sa création. | — | Voir F18 au chapitre 10 |

## 4.5. Cotutelles de thèses

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-COT-01 | La cotutelle de thèse est un type de collaboration académique distinct, associée à un doctorant précis et à une université partenaire. | RG20 | Une cotutelle est créée en désignant un établissement malgache et un partenaire (université partenaire) |
| BF-COT-02 | Une cotutelle de thèse comporte : l'établissement malgache, l'université partenaire, le nom du doctorant, sa spécialité, le directeur de thèse local, le directeur de thèse partenaire, le type (co-tutelle ou co-encadrement), la date de début, la date prévisionnelle de soutenance, le financement ou la bourse, la mobilité réalisée, les publications produites, l'état d'avancement, les difficultés rencontrées et les perspectives. | RG20 | L'ensemble de ces informations figure sur la fiche de la cotutelle |
| BF-COT-03 | Le type de collaboration distingue la co-tutelle du co-encadrement. | Section 5.6 du document v4 | Le type est sélectionnable parmi les deux valeurs |
| BF-COT-04 | Une cotutelle peut être associée à une convention, sur le même principe que les partenariats et les projets. | RG21 | Une convention peut être rattachée à une cotutelle |
| BF-COT-05 | La gestion des cotutelles relève de l'équipe Projet et Partenariat ; le Décideur y accède en consultation, l'Établissement n'y a pas accès. | Section 12 du document v4 | Seules la Présidence (gestion) et le Décideur (consultation) accèdent aux cotutelles |

## 4.6. Projets

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-PRO-01 | Un projet peut comporter : un nom, un intitulé officiel, un type ou domaine, un budget total, une date de début, une date de fin, un statut, un établissement responsable, un partenariat concerné (facultatif), un porteur, un ou plusieurs bailleurs, un ou plusieurs partenaires propres, un ou plusieurs bénéficiaires, un ou plusieurs sites, plusieurs activités, une convention éventuelle et une publication éventuelle. | RG08, RG09, RG14, RG15, RG19 | Toutes ces informations figurent sur la fiche du projet et sont saisissables |
| BF-PRO-02 | Le nom et l'intitulé officiel d'un projet sont deux informations distinctes. | RG08 | Deux champs distincts existent sur la fiche du projet |
| BF-PRO-03 | Le budget, le type et le statut sont directement enregistrés comme des attributs du projet. | RG09 | Ces trois informations sont saisies sur le projet lui-même |
| BF-PRO-04 | Un projet n'est pas obligatoirement rattaché à un partenariat : il peut exister de façon autonome, avec ses propres partenaires directement associés. | RG19 | Un projet peut être créé sans partenariat et recevoir des partenaires propres |
| BF-PRO-05 | Un projet peut posséder ses propres partenaires, en complément ou en l'absence de partenariat. | RG19 | Des partenaires propres peuvent être sélectionnés même lorsque le projet est rattaché à un partenariat |
| BF-PRO-06 | Un projet peut être associé à un ou plusieurs sites ; un site peut être associé à plusieurs projets. | RG14 | La sélection de plusieurs sites est possible et un même site est réutilisable par plusieurs projets |
| BF-PRO-07 | Un projet peut être associé à plusieurs bénéficiaires ; un bénéficiaire peut être associé à plusieurs projets. | RG15 | La sélection de plusieurs bénéficiaires est possible, par liste ou cases à cocher |
| BF-PRO-08 | La durée et les dates prévues du projet permettent au système de suivre le respect de son calendrier global. | Section 5.7 du document v4 | Les dates du projet sont enregistrées et comparables à la date du jour |
| BF-PRO-09 | Lorsqu'un projet dépasse sa date de fin prévue sans être terminé, la plateforme l'identifie comme étant en retard et génère une notification. | RG40 | Un projet dont la date de fin prévue est dépassée et qui n'est pas terminé est signalé comme en retard et notifié |
| BF-PRO-10 | Les activités d'un projet permettent de calculer automatiquement son avancement ; le statut du projet reste indépendant du pourcentage d'avancement. | RG13 | L'avancement affiché découle des activités ; modifier le statut ne modifie pas l'avancement |
| BF-PRO-11 | *(à préciser)* Le document v4 ne donne pas la liste des statuts d'un projet, ni les règles de passage d'un statut à un autre, ni qui peut les modifier. | — | Voir F17 au chapitre 10 |
| BF-PRO-12 | *(à préciser)* Le document v4 ne précise pas la devise ni le format d'affichage du budget total d'un projet. | — | Voir F6 au chapitre 10 |
| BF-PRO-13 | *(à préciser)* Le document v4 ne précise pas si les listes associées à un projet (partenaires propres, bénéficiaires, bailleurs, sites) peuvent être modifiées après sa création. | — | Voir F18 au chapitre 10 |

---

## 4.7. Porteurs, bailleurs, bénéficiaires et sites

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-REF-01 | Le porteur représente la personne responsable du projet. Les informations identifiées comprennent son nom et son institution de rattachement. | RG10 | Un porteur est créé ou sélectionné et rattaché au projet |
| BF-REF-02 | La plateforme conserve les informations relatives aux bailleurs intervenant dans le financement des projets ; la structure définitive de ces informations reste à consolider au fil de l'usage et comporte a minima un nom et une description. | Section 5.9 du document v4, section 11.5 | Un bailleur comporte au moins un nom et une description, et un projet peut en référencer plusieurs |
| BF-REF-03 | Un projet peut être associé à plusieurs bénéficiaires et un même bénéficiaire à plusieurs projets ; la sélection se fait simplement à partir d'une liste ou de cases à cocher. | RG15 | La sélection multiple est possible sans saisie de code ni de référence |
| BF-REF-04 | Le site représente le lieu où un projet est appliqué ou réalisé. C'est une entité indépendante : un projet peut concerner plusieurs sites et un même site peut être associé à plusieurs projets. | RG14, section 5.11 du document v4 | Un projet affiche ses sites ; un site réutilisé par un autre projet n'est pas dupliqué |
| BF-REF-05 | *(à préciser)* Le document v4 ne précise pas qui crée et met à jour ces référentiels (porteurs, bailleurs, bénéficiaires, sites) : un établissement doit-il pouvoir le faire, ou l'équipe Projet et Partenariat seulement ? | — | Voir F4 au chapitre 10 |

## 4.8. Activités, avancement et chronogramme

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-ACT-01 | Chaque projet est décomposé en plusieurs activités ; une activité appartient à un seul projet. | RG11 | Plusieurs activités peuvent être ajoutées à un projet ; une activité n'appartient qu'à un projet |
| BF-ACT-02 | Une activité possède un intitulé et un état (terminée ou non), matérialisé par une case à cocher. | Section 5.12 du document v4 | L'utilisateur coche ou décoche une activité pour la marquer terminée |
| BF-ACT-03 | L'avancement du projet est calculé automatiquement : nombre d'activités terminées divisé par le nombre total d'activités, multiplié par cent. | RG13 | L'avancement affiché change immédiatement lorsqu'une activité est cochée |
| BF-ACT-04 | Le statut du projet reste indépendant du pourcentage d'avancement. | RG13 | Le statut et l'avancement sont affichés séparément et n'agissent pas l'un sur l'autre |
| BF-ACT-05 | Chaque activité peut comporter une échéance permettant de suivre le respect du calendrier prévu. | Section 5.12 du document v4 | Une date d'échéance est saisissable sur l'activité |
| BF-ACT-06 | Lorsque l'échéance d'une activité est dépassée alors que l'activité n'est pas terminée, l'activité est considérée comme en retard et fait l'objet d'une notification. | RG39 | Une activité non terminée dont l'échéance est passée apparaît en retard et génère une notification |
| BF-ACT-07 | Lorsqu'une activité approche de sa date limite, une notification peut être générée afin d'attirer l'attention sur son échéance prochaine. | RG38 | Selon le seuil retenu, une activité proche de son échéance génère une alerte (seuil à confirmer, voir F10) |
| BF-ACT-08 | Indépendamment de la case à cocher « terminée », chaque activité fait l'objet d'un suivi périodique détaillé correspondant à la pratique actuelle de l'équipe : le nombre de jours consacrés à l'activité, par mois et par trimestre. | RG12, section 5.13 du document v4 | Pour une activité, l'utilisateur saisit une année, un trimestre, un mois et un nombre de jours |
| BF-ACT-09 | Une activité peut posséder plusieurs entrées de chronogramme, une par mois suivi. | RG12 | Plusieurs lignes de suivi peuvent être enregistrées pour la même activité |
| BF-ACT-10 | Le suivi en jours est indépendant du calcul automatique d'avancement et n'alimente pas automatiquement la synthèse nationale : les deux mécanismes coexistent, à des fins différentes. | Section 5.13 du document v4, RG44 | Cocher une activité ne crée pas de ligne de chronogramme, et saisir des jours ne modifie pas l'avancement ni les compteurs de la synthèse |
| BF-ACT-11 | Les activités, l'avancement et le chronogramme sont gérés par l'équipe Projet et Partenariat pour tous les projets, et par chaque établissement pour ses propres projets ; le Décideur y accède en consultation. | Section 12 du document v4 | Un établissement peut saisir les activités de ses projets ; le Décideur ne peut que les consulter |
| BF-ACT-12 | *(à préciser)* Le document v4 ne précise pas la présentation attendue du chronogramme (grille annuelle par mois, vue par trimestre, cumul de jours) ni la période de saisie ouverte. | — | Voir F23 au chapitre 10 |

## 4.9. Documents

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-DOC-01 | La plateforme conserve les documents associés aux projets et aux conventions, notamment les termes de référence (TDR), les descriptions de projet et les conventions elles-mêmes. | Section 5.14 du document v4, RG25 | Un document est téléversé puis retrouvé dans la fiche du projet ou de la convention concernée |
| BF-DOC-02 | Un document est rattaché directement à un projet ou à une convention, selon sa nature. | RG25 | Le rattachement à un projet ou à une convention est demandé au moment du dépôt |
| BF-DOC-03 | Lorsqu'un nouveau document remplace un document existant, l'ancienne version n'est pas supprimée : elle est conservée à l'état archivé. | RG24 | Après remplacement, l'ancienne version reste listée comme archivée |
| BF-DOC-04 | Chaque document, quelle que soit sa nature, peut être téléchargé par les utilisateurs autorisés, y compris ses anciennes versions archivées. | RG24, RG25 | Le téléchargement fonctionne pour la version courante comme pour les versions antérieures |
| BF-DOC-05 | Les documents relèvent de l'équipe Projet et Partenariat pour l'ensemble du périmètre ; un établissement accède à ses propres documents ; le Décideur n'y a pas accès. | Section 12 du document v4 | Les droits de consultation et de dépôt respectent ce tableau |
| BF-DOC-06 | *(à préciser)* Les formats de fichiers et les limites de taille acceptés sont renvoyés par le document v4 à la conception technique ; ils sont à valider par la maîtrise d'ouvrage. | Section 11.3 du document v4 | Voir F22 au chapitre 10 |

## 4.10. Conventions

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-CNV-01 | Une convention est une entité indépendante, associée à un partenariat, un projet ou une cotutelle de thèse selon le contexte. | RG21 | À la création, la convention est reliée à un partenariat, un projet ou une cotutelle |
| BF-CNV-02 | Une convention comporte une référence, un titre, une date de signature, une date de début, une date de fin, un statut et une description. | Section 5.15 du document v4 | Ces informations figurent sur la fiche de la convention |
| BF-CNV-03 | Les statuts possibles sont notamment : En préparation, En attente de signature, Signée, Active, Suspendue, Expirée et Archivée. | Section 5.15 du document v4 | Les sept libellés de statut sont proposés à la saisie et à la mise à jour |
| BF-CNV-04 | Avant sa signature, une convention suit un circuit de traitement interne (par exemple : Projet et Partenariat, Secrétaire principale, Direction des Affaires Juridiques, Signature). L'étape courante du circuit et la date du dernier changement sont enregistrées et mises à jour manuellement par l'équipe Projet et Partenariat. | RG22 | La fiche de la convention affiche l'étape courante et la date de son dernier changement ; l'étape est modifiable manuellement |
| BF-CNV-05 | Le suivi automatique de la période de validité est assuré à partir des dates de début et de fin : la plateforme identifie les conventions approchant de leur expiration et celles dont la période de validité est dépassée. | Section 5.15 du document v4, RG36, RG37 | Une convention proche de son échéance ou dépassée est signalée et notifiée |
| BF-CNV-06 | Les conventions signées peuvent être archivées et téléchargées ; l'archivage ne constitue pas une suppression définitive. | RG23, RG26 | Une convention archivée reste consultable dans les archives et son document reste téléchargeable |
| BF-CNV-07 | La gestion des conventions relève de l'équipe Projet et Partenariat ; un établissement accède aux siennes ; le Décideur y accède en consultation. | Section 12 du document v4 | Les droits respectent ce tableau |
| BF-CNV-08 | *(à préciser)* Le document v4 indique que l'étape du circuit est mise à jour « hors plateforme » (RG22) tout en demandant que la fiche convention présente l'étape de circuit : il reste à trancher si la mise à jour de l'étape se fait dans la plateforme ou à l'extérieur. | — | Voir F21 au chapitre 10 |

## 4.11. Archivage

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-ARC-01 | Les partenaires, partenariats, projets, cotutelles et conventions qui ne sont plus actifs peuvent être archivés, de même que les anciennes versions des documents. | Section 5.16 du document v4 | Chacun de ces éléments dispose d'une action d'archivage |
| BF-ARC-02 | L'équipe Projet et Partenariat dispose d'un accès global aux archives ; un établissement ne consulte que les siennes. | RG05, section 5.16 | La liste des archives est filtrée selon l'établissement du compte |
| BF-ARC-03 | L'archivage ne constitue pas une suppression définitive : les éléments archivés restent consultables avec leurs informations. | RG26 | Un élément archivé est retrouvé dans les archives avec ses données |
| BF-ARC-04 | Les archives sont consultables par type d'élément et par recherche. | Section 5.19, section 10 du document v4 | L'écran des archives permet de retrouver un élément archivé par recherche |
| BF-ARC-05 | *(à préciser)* Le document v4 définit l'archivage pour les éléments « qui ne sont plus actifs » sans préciser le critère exact (statut, date, décision de l'équipe) ni si un élément archivé peut être remis en service. | — | Voir F19 au chapitre 10 |

## 4.12. Logos et identité visuelle

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-LOG-01 | Chaque établissement et chaque partenaire possède un logo, affiché dans les fiches, les listes et les publications publiques. | RG27 | Le logo apparaît sur la fiche et dans les listes de l'établissement et du partenaire, ainsi que sur la publication publique |
| BF-LOG-02 | L'équipe Projet et Partenariat utilise le logo officiel de l'Université, élément fixe de l'identité visuelle de la plateforme. | Section 5.17 du document v4 | Le logo officiel est présent dans l'interface et sur la publication publique |
| BF-LOG-03 | *(à préciser)* Le document v4 ne précise pas qui dépose les logos, sous quels formats, ni s'ils font l'objet d'une validation avant affichage. | — | Voir F20 au chapitre 10 |
| BF-LOG-04 | *(à préciser)* Le document v4 ne fournit pas le fichier du logo officiel de l'Université. | — | À fournir par la maîtrise d'ouvrage |

## 4.13. Publications

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-PUB-01 | Un projet peut faire l'objet d'une publication destinée à l'espace public. La publication est une entité séparée du projet, afin de ne pas mélanger les données de gestion interne et le contenu de communication. | Section 5.18 du document v4 | Créer ou modifier une publication ne modifie pas les données de gestion du projet |
| BF-PUB-02 | Une publication comporte un titre, une description publique, une date de publication, un statut (Brouillon ou Publiée), l'établissement concerné, les partenaires, les bénéficiaires et les résultats du projet. | Section 5.18 du document v4 | Ces informations figurent sur la fiche de la publication |
| BF-PUB-03 | Une publication peut contenir plusieurs photos d'illustration, avec légende et ordre d'affichage facultatifs. | RG29 | Plusieurs photos peuvent être ajoutées, légendées et ordonnées |
| BF-PUB-04 | Un projet peut être associé à au plus une publication. | RG29 | Une deuxième publication ne peut pas être créée pour le même projet |
| BF-PUB-05 | Seule une publication au statut « Publiée » est visible par le visiteur. | RG30 | Une publication en brouillon n'apparaît pas dans l'espace public |
| BF-PUB-06 | La publication affiche l'établissement et son logo, les partenaires et leurs logos, les bénéficiaires, la période et les résultats du projet. | Section 10 du document v4 | La page publique de la publication présente ces éléments |
| BF-PUB-07 | La gestion des publications relève de l'équipe Projet et Partenariat ; un établissement gère les siennes ; le Décideur y accède en consultation ; le visiteur ne voit que les publications publiées. | Section 12 du document v4 | Les droits respectent ce tableau |

## 4.14. Recherche et filtrage

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-REC-01 | Une recherche rapide porte sur les partenaires, les partenariats, les cotutelles, les projets, les conventions et les archives. | Section 5.19 du document v4 | Une même recherche retrouve les éléments de ces six familles |
| BF-REC-02 | Les projets sont filtrables par établissement, partenaire, partenariat, type, statut, période et avancement. | Section 5.19 du document v4, RG13 | Chacun de ces critères réduit effectivement la liste affichée |
| BF-REC-03 | Les conventions sont filtrables par partenaire, partenariat, projet, statut, période et date d'expiration. | Section 5.19 du document v4 | Chacun de ces critères réduit effectivement la liste affichée |
| BF-REC-04 | Le périmètre de la recherche dépend du rôle : la Présidence recherche sur toutes les données, un établissement sur ses propres données, le Décideur sur toutes les données en consultation, le visiteur sur les données publiques. | RG05, RG07, RG31, RG32 | Une recherche menée par un établissement ne retourne jamais de données d'un autre établissement |
| BF-REC-05 | *(à préciser)* Le document v4 mentionne la recherche des archives sans préciser si elles doivent apparaître dans la recherche générale ou seulement dans leur écran dédié. | — | Voir F19 au chapitre 10 |

## 4.15. Tableau de bord

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-TDB-01 | Chaque utilisateur interne dispose d'un tableau de bord adapté à son rôle. | Section 5.20 du document v4 | Trois tableaux de bord distincts existent : Présidence, Établissement, Décideur |
| BF-TDB-02 | Le tableau de bord de l'équipe Projet et Partenariat présente une vision globale : nombre de partenaires, de partenariats, de cotutelles, projets par statut, conventions actives, expirées et bientôt expirées. | Section 5.20 du document v4 | Chacun de ces indicateurs est affiché et correspond aux données enregistrées |
| BF-TDB-03 | Le tableau de bord d'un établissement présente uniquement ses propres données. | RG05 | Les compteurs affichés correspondent aux seuls éléments de l'établissement connecté |
| BF-TDB-04 | Le tableau de bord du Décideur privilégie les indicateurs globaux, avec accès possible au détail des fiches en lecture seule. | RG32 | Les indicateurs sont globaux et l'ouverture d'une fiche ne propose aucune action de modification |
| BF-TDB-05 | *(à préciser)* Le document v4 ne précise pas à partir de quel délai une convention est considérée comme « bientôt expirée » sur le tableau de bord. | — | Voir F10 au chapitre 10 |

## 4.16. Synthèse annuelle

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-SYN-01 | La synthèse nationale annuelle, historiquement produite à la main dans le fichier `Synthese_national`, est générée automatiquement par établissement à partir des données enregistrées : nombre de partenaires, conventions actives et expirées, cotutelles, projets actifs. | RG44 | Les compteurs d'une synthèse annuelle correspondent aux données de l'année concernée sans ressaisie |
| BF-SYN-02 | La synthèse est complétée par un petit nombre d'éléments narratifs saisis par l'équipe : principaux domaines, partenaires stratégiques (sélectionnés parmi les partenaires existants), défis majeurs et priorités futures. | RG44 | L'équipe saisit ces éléments pour un établissement et une année donnés |
| BF-SYN-03 | Les compteurs ne sont pas saisis manuellement : ils sont calculés à partir des données existantes, afin d'éviter toute donnée dupliquée ou périmée. | RG44, section 7 du document v4 | Aucun champ de saisie de compteur n'existe ; les valeurs suivent les données |
| BF-SYN-04 | La désignation d'un partenaire comme stratégique dans la synthèse s'appuie sur les partenaires existants et sur l'indicateur « partenaire stratégique ». | RG44, section 5.4 du document v4 | Les partenaires proposés pour la synthèse sont ceux déjà enregistrés |
| BF-SYN-05 | La synthèse est produite par établissement et couvre l'année civile demandée. | RG44 | La synthèse d'un établissement et d'une année est consultable séparément |
| BF-SYN-06 | La synthèse est générée et complétée par l'équipe Projet et Partenariat ; le Décideur y accède en consultation ; l'Établissement n'y a pas accès. | Section 12 du document v4 | Les droits respectent ce tableau |
| BF-SYN-07 | *(à préciser)* Le document v4 ne précise pas le format de restitution attendu de la synthèse (présentation à l'écran, document exportable, modèle officiel de mise en page). | — | Voir F9 au chapitre 10 |

## 4.17. Notifications

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-NTF-01 | Une notification est générée lorsque l'établissement ajoute un nouveau partenaire, un nouveau partenariat ou un nouveau projet, afin que l'équipe Projet et Partenariat prenne connaissance des informations enregistrées. | RG34 | Après un ajout par un établissement, l'équipe Projet et Partenariat reçoit une notification l'indiquant |
| BF-NTF-02 | Une notification peut être générée lorsqu'une modification importante est effectuée sur une information suivie par l'équipe Projet et Partenariat. | RG35 | La notion de modification importante et le déclenchement sont à confirmer (voir F24) |
| BF-NTF-03 | Le système surveille les dates de validité des conventions : lorsqu'une convention approche de sa date d'expiration, une notification est générée automatiquement. | RG36 | Une convention dont l'échéance approche génère une alerte sans intervention manuelle |
| BF-NTF-04 | Plusieurs niveaux d'alerte peuvent être définis, par exemple trente, quinze ou sept jours avant l'expiration. | RG36 | Les seuils retenus produisent chacun leur alerte (valeurs à confirmer, voir F10) |
| BF-NTF-05 | Lorsqu'une convention dépasse sa date de fin de validité, le système indique automatiquement qu'elle est expirée et génère une notification destinée aux utilisateurs concernés. | RG37 | Une convention dont la date de fin est dépassée apparaît expirée et génère une notification |
| BF-NTF-06 | Le système suit les échéances des activités : lorsqu'une activité approche de sa date limite, une notification peut être générée. | RG38 | Une activité proche de son échéance génère une alerte selon le seuil retenu |
| BF-NTF-07 | Lorsqu'une activité dépasse son échéance sans être marquée comme terminée, le système génère une notification indiquant qu'elle est en retard. | RG39 | Une activité en retard génère une notification |
| BF-NTF-08 | Lorsqu'un projet dépasse sa date de fin prévue sans être terminé, le système signale automatiquement que le projet présente un retard. | RG40 | Un projet en retard génère une notification |
| BF-NTF-09 | Chaque notification comporte un titre court, un message détaillé, un type, un niveau de priorité, une date et une heure de création, un état lu ou non lu et l'identification de l'élément concerné pour un accès direct. | Section 7.1 du document v4 | Ces informations sont visibles sur chaque notification |
| BF-NTF-10 | Les notifications sont accessibles depuis un espace dédié ; chaque notification peut être marquée comme lue ou non lue afin de distinguer les nouvelles alertes des notifications déjà consultées. | RG41, section 5.21 du document v4 | L'utilisateur marque une notification comme lue et la distinction persiste |
| BF-NTF-11 | La sélection d'une notification permet d'accéder directement à l'élément concerné afin d'en consulter les informations. | Section 9.1 du document v4 | Un clic sur la notification ouvre la fiche de l'élément visé |
| BF-NTF-12 | Les notifications automatiques relatives aux dates d'expiration et aux retards sont produites par une vérification périodique du système, exécutée par exemple quotidiennement, portant sur les conventions, les activités et les projets. | RG43 | Une convention, une activité ou un projet atteignant sa condition d'alerte reçoit une notification sans action d'un utilisateur |
| BF-NTF-13 | Une notification est associée à l'utilisateur ou au groupe d'utilisateurs concerné. | RG42 | Chaque destinataire voit la notification dans son espace |
| BF-NTF-14 | Le système limite la répétition excessive des notifications concernant un même événement. | Section 11.6 du document v4 | Une même échéance ne produit pas une alerte répétée à chaque vérification (modalités à confirmer, voir F24) |
| BF-NTF-15 | Les notifications relèvent de l'équipe Projet et Partenariat et des établissements pour leurs propres données ; le Décideur et le visiteur n'en ont pas. | Section 12 du document v4 | Les droits respectent ce tableau |

## 4.18. Espace public

| Réf. | Besoin fonctionnel | Règles | Vérification attendue |
|---|---|---|---|
| BF-EPU-01 | L'espace public comporte les rubriques : Accueil, À propos, Établissements, Partenaires, Projets et Partenariats, Contact. | Section 5.22 du document v4 | Les six rubriques sont accessibles sans compte |
| BF-EPU-02 | La page d'accueil présente le logo de l'Université, une présentation générale, des statistiques publiques, les projets récemment publiés, les partenaires et les établissements, ainsi qu'un accès à la connexion. | Section 10 du document v4 | Ces éléments sont présents sur la page d'accueil |
| BF-EPU-03 | L'espace public présente les publications au statut « Publiée » ainsi que les informations non confidentielles relatives aux établissements et partenaires. | RG30, RG31 | Seules les publications publiées et les partenaires de visibilité publique sont visibles |
| BF-EPU-04 | Les informations publiques sont séparées des informations internes ou confidentielles : les données de gestion (contacts internes, budgets, documents, conventions) ne sont pas exposées au visiteur. | RG31 | Aucune donnée de gestion n'apparaît dans les pages publiques |
| BF-EPU-05 | Les projets et partenariats présentés au public sont ceux ayant fait l'objet d'une publication publiée. | RG30, section 12 du document v4 | La rubrique « Projets et Partenariats » n'affiche que les publications publiées |
| BF-EPU-06 | *(à préciser)* Le document v4 mentionne une rubrique « Contact » sans préciser le traitement des messages : destinataire, enregistrement, réponse. | — | Voir F8 au chapitre 10 |
| BF-EPU-07 | *(à préciser)* Le document v4 ne détaille pas le contenu exact attendu de la vitrine publique (coordonnées des partenaires, montants des projets, statistiques présentées). | — | Voir F12 au chapitre 10 |

---

# 5. Règles de gestion

Les quarante-quatre règles ci-dessous sont reprises **mot pour mot** du cahier des charges version 4 (section 6). Elles constituent le cadre que toute évolution de la plateforme doit respecter. L'annexe A indique, pour chaque règle, les besoins fonctionnels du chapitre 4 qui la mettent en œuvre.

| Code | Règle de gestion |
|---|---|
| RG01 | La Présidence dispose d'un compte unique utilisé par l'équipe Projet et Partenariat. |
| RG02 | Chaque établissement dispose d'un compte unique, associé à un seul établissement. |
| RG03 | Un ou plusieurs comptes Décideur peuvent exister, non rattachés à un établissement. |
| RG04 | Le visiteur peut accéder aux informations publiques sans compte. |
| RG05 | Un établissement ne peut ajouter, consulter et modifier que ses propres informations, depuis son espace de gestion dédié. |
| RG06 | Les informations ajoutées par un établissement sont automatiquement rattachées à celui-ci. |
| RG07 | L'équipe Projet et Partenariat dispose d'une vision globale de toutes les informations enregistrées. |
| RG08 | Le nom et l'intitulé officiel d'un projet sont deux informations distinctes. |
| RG09 | Le budget, le type et le statut sont des attributs du projet. |
| RG10 | Le porteur représente la personne responsable d'un projet. |
| RG11 | Un projet peut comporter plusieurs activités ; une activité appartient à un seul projet. |
| RG12 | Une activité peut posséder plusieurs entrées de chronogramme (suivi en jours par mois). |
| RG13 | L'avancement d'un projet est calculé automatiquement à partir des activités terminées, indépendamment du chronogramme. |
| RG14 | Un projet peut être associé à un ou plusieurs sites ; un site peut être associé à plusieurs projets. |
| RG15 | Un projet peut être associé à plusieurs bénéficiaires ; un bénéficiaire peut être associé à plusieurs projets. |
| RG16 | Un partenaire est rattaché à un établissement et peut participer à plusieurs partenariats, cotutelles et projets. |
| RG17 | Un partenariat peut concerner un ou plusieurs établissements et un ou plusieurs partenaires. |
| RG18 | Un partenariat peut comporter plusieurs projets ; un projet n'est rattaché qu'à un seul partenariat au plus, ou à aucun. |
| RG19 | Un projet peut posséder ses propres partenaires, en complément ou en l'absence de partenariat. |
| RG20 | Une cotutelle de thèse est associée à un établissement malgache et à un partenaire (université partenaire). |
| RG21 | Une convention est associée à un partenariat, un projet ou une cotutelle de thèse selon le contexte. |
| RG22 | L'étape du circuit de traitement d'une convention est mise à jour manuellement par l'équipe Projet et Partenariat, hors plateforme. |
| RG23 | Les conventions signées doivent pouvoir être archivées et téléchargées. |
| RG24 | Une ancienne version d'un document n'est pas supprimée lors du téléversement d'une nouvelle, et reste elle-même téléchargeable. |
| RG25 | Un document peut être rattaché directement à un projet ou à une convention, et doit pouvoir être téléchargé par les utilisateurs autorisés. |
| RG26 | L'archivage ne constitue pas une suppression définitive. |
| RG27 | Chaque établissement et chaque partenaire possède un logo. |
| RG28 | Un contact est rattaché à un seul partenaire. |
| RG29 | Un projet peut être associé à au plus une publication ; une publication peut posséder plusieurs photos. |
| RG30 | Seule une publication au statut « Publiée » est visible par le visiteur. |
| RG31 | Les informations publiques sont séparées des informations internes ou confidentielles. |
| RG32 | Le Décideur dispose d'un accès en lecture seule aux indicateurs agrégés et au détail des fiches. |
| RG33 | La gestion administrative des établissements ne fait pas partie du rôle de l'équipe Projet et Partenariat. |
| RG34 | Une notification est générée lorsqu'un établissement ajoute un nouveau partenaire, un nouveau partenariat ou un nouveau projet. |
| RG35 | Une notification peut être générée lorsqu'une modification importante est effectuée sur une information suivie par l'équipe Projet et Partenariat. |
| RG36 | Le système génère automatiquement une notification lorsqu'une convention approche de sa date d'expiration (plusieurs seuils possibles, par exemple 30, 15 ou 7 jours avant échéance). |
| RG37 | Le système génère automatiquement une notification lorsque la date de fin de validité d'une convention est dépassée. |
| RG38 | Une notification peut être générée lorsqu'une activité approche de son échéance. |
| RG39 | Le système génère automatiquement une notification lorsqu'une activité dépasse son échéance sans être marquée comme terminée. |
| RG40 | Le système génère automatiquement une notification lorsqu'un projet dépasse sa date de fin prévue sans être terminé. |
| RG41 | Une notification possède un état indiquant si elle a été lue ou non lue. |
| RG42 | Une notification est associée à l'utilisateur ou au groupe d'utilisateurs concerné. |
| RG43 | Les contrôles relatifs aux conventions, aux activités et aux projets sont exécutés périodiquement par le système (par exemple quotidiennement) afin d'identifier les expirations et les retards. |
| RG44 | La synthèse annuelle par établissement est calculée automatiquement à partir des données existantes ; seuls les éléments narratifs (domaines, partenaires stratégiques, défis, priorités) sont saisis manuellement. |

Les principes d'ergonomie — masquer les relations complexes à l'utilisateur, regrouper les partenaires et les partenariats dans une même interface — sont traités avec les exigences non fonctionnelles (section 8.1) et non comme des règles de gestion, conformément au document v4.

---

# 6. Parcours utilisateurs attendus

Ces parcours décrivent ce que chaque acteur doit pouvoir faire, de bout en bout. Ils servent de fil conducteur à la recette (chapitre 9).

## 6.1. Équipe Projet et Partenariat

1. **Connexion** avec le compte unique de la Présidence, accès au tableau de bord global.
2. **Consultation et gestion complète** des partenaires, partenariats, cotutelles, projets, conventions, documents, publications et archives, pour l'ensemble des établissements.
3. **Suivi des projets** : ouverture d'une fiche projet, consultation des activités, de l'avancement, du chronogramme, des documents et de la convention rattachée.
4. **Traitement des conventions** : mise à jour de l'étape du circuit de traitement, suivi du statut, archivage des conventions signées.
5. **Production de la synthèse annuelle** par établissement : compteurs calculés automatiquement, complément narratif saisi et désignation des partenaires stratégiques.
6. **Exploitation des notifications** : prise de connaissance des nouveaux éléments ajoutés par les établissements, des conventions approchant de leur expiration ou expirées, des activités et projets en retard. La sélection d'une notification ouvre directement l'élément concerné ; la notification est ensuite marquée comme lue.
7. **Recherche et filtrage** transverses pour retrouver un élément ou préparer un état.

## 6.2. Établissement

1. **Connexion** avec le compte unique de l'établissement, accès à son espace de gestion minimal et séparé de l'espace public.
2. **Consultation de ses listes** : ses partenaires, ses partenariats et ses projets, avec leur statut.
3. **Recherche d'un partenaire existant avant toute création**, afin d'éviter les doublons.
4. **Création d'un partenariat** : sélection des établissements et des partenaires concernés, puis saisie de l'intitulé, du domaine, des dates, du statut et des champs de suivi narratifs.
5. **Création d'un projet**, rattaché ou non à un partenariat, avec ses partenaires propres, ses bénéficiaires, ses sites, son porteur, ses bailleurs et son budget.
6. **Décomposition du projet en activités** et suivi de son chronogramme : saisie des jours consacrés par mois et par trimestre.
7. **Gestion de la convention** et téléversement du document associé lorsqu'il est disponible.
8. **Création éventuelle d'une publication** avec photos si le projet doit être rendu public.
9. **Réception des notifications** concernant ses propres données (alertes d'expiration de convention et de retard).

## 6.3. Décideur

1. **Connexion** et accès à un tableau de bord global présentant les indicateurs agrégés.
2. **Consultation du détail des fiches** (partenaires, partenariats, projets, conventions, cotutelles, publications, synthèse) en lecture seule, sans aucune action de modification.
3. **Recherche** dans le périmètre global, en consultation.

## 6.4. Visiteur

1. **Accès direct à la partie publique**, sans compte : accueil, à propos, établissements, partenaires, projets et partenariats publiés, contact.
2. **Consultation d'une publication** : titre, description publique, établissement et logo, partenaires et logos, bénéficiaires, période, résultats et galerie de photos.
3. **Accès au formulaire de connexion** depuis l'espace public, pour les utilisateurs disposant d'un compte.

## 6.5. Enchaînement général du fonctionnement

*(Repris de la synthèse du document v4, section 13.)*

L'établissement recherche ou ajoute ses partenaires depuis son espace de gestion dédié, puis peut créer un partenariat en sélectionnant les établissements et les partenaires concernés. À partir de ce partenariat, un ou plusieurs projets peuvent être enregistrés — un projet pouvant également exister de façon autonome, avec ses propres partenaires.

Chaque projet se décompose en activités permettant de calculer automatiquement son avancement, et fait l'objet d'un suivi de chronogramme en nombre de jours par mois. Les cotutelles de thèses avec des universités partenaires sont suivies de façon spécifique, avec leurs propres informations (doctorant, directeurs, financement, avancement).

Une convention peut être associée au partenariat, au projet ou à la cotutelle selon le contexte ; son étape de circuit interne est suivie jusqu'à sa signature, puis son statut rend compte de son cycle de vie.

Un projet destiné à la communication publique fait l'objet d'une publication séparée, enrichie de photos. La synthèse annuelle de l'activité de coopération de l'Université, historiquement produite à la main, est calculée automatiquement par établissement à partir des données enregistrées, et complétée par quelques éléments narratifs saisis par l'équipe.

La plateforme intègre un système de notifications : les actions importantes réalisées par les établissements sont signalées à l'équipe Projet et Partenariat, et les dates des conventions, des activités et des projets sont vérifiées périodiquement afin d'identifier les échéances proches, les conventions expirées et les retards.

L'établissement reste limité à ses propres données ; l'équipe Projet et Partenariat dispose d'une vision globale et des fonctionnalités de gestion ; le Décideur dispose d'une vue de consultation ; le visiteur accède uniquement aux publications rendues publiques.

---

# 7. Écrans attendus

Le document v4 décrit dix écrans principaux (section 10). Le tableau ci-dessous précise, pour chacun, le contenu fonctionnel attendu. Aucun écran supplémentaire obligatoire n'est imposé par la maîtrise d'ouvrage ; les écrans de saisie intermédiaires nécessaires à ces contenus restent à l'appréciation de la maîtrise d'œuvre.

| Écran | Contenu fonctionnel attendu |
|---|---|
| **Accueil public** | Logo de l'Université, présentation générale, statistiques publiques, projets récemment publiés, partenaires et établissements, accès à la connexion |
| **À propos** | Présentation de l'Université et de son activité de coopération |
| **Établissements (public)** | Liste des établissements avec nom, sigle et logo, et informations non confidentielles |
| **Partenaires (public)** | Partenaires de visibilité publique : nom, type, pays, logo, description, site web éventuel |
| **Projets et Partenariats (public)** | Publications publiées, avec accès au détail d'une publication |
| **Contact** | Formulaire de contact ouvert aux visiteurs (traitement attendu à préciser, voir F8) |
| **Connexion** | Identifiant, mot de passe, bouton de connexion, lien vers l'espace public |
| **Tableau de bord Présidence** | Nombre de partenaires, partenariats, cotutelles, projets par statut, conventions actives, expirées et bientôt expirées |
| **Tableau de bord Établissement** | Mêmes indicateurs, limités aux données de l'établissement |
| **Tableau de bord Décideur** | Indicateurs globaux, accès au détail des fiches en lecture seule |
| **Espace établissement** | Liste de ses partenaires, partenariats et projets avec leur statut ; bouton d'ajout ; formulaire de modification |
| **Partenaires et partenariats** | Recherche ou ajout d'un partenaire (logo, nom, type, pays, contact), puis sélection des établissements et partenaires concernés et saisie du partenariat (intitulé, domaine, dates, statut, champs narratifs) |
| **Cotutelles de thèses** | Liste et fiche : doctorant, université partenaire, directeurs, dates, financement, état d'avancement |
| **Fiche projet** | Informations générales, partenariat, partenaires propres, bénéficiaires, porteur, bailleurs, sites, avancement, activités et chronogramme, convention, documents, publication éventuelle |
| **Fiche convention** | Référence, titre, partenariat / projet / cotutelle lié, dates, étape de circuit, statut, document actuel et historique |
| **Synthèse annuelle** | Compteurs calculés automatiquement par établissement, complétés par les champs narratifs saisis par l'équipe |
| **Archives** | Partenaires, partenariats, cotutelles, projets, conventions et documents archivés, avec recherche |
| **Publication** | Titre, description, établissement et logo, partenaires et logos, bénéficiaires, période, résultats, galerie de photos |
| **Notifications** | Liste des notifications avec distinction lu / non lu et accès direct à l'élément concerné |
| **Recherche** | Recherche rapide sur les partenaires, partenariats, cotutelles, projets, conventions et archives, avec filtres par domaine |

---

# 8. Exigences non fonctionnelles

*(Reprises du cahier des charges version 4, section 11.)*

## 8.1. Simplicité d'utilisation et ergonomie

| Réf. | Exigence |
|---|---|
| ENF-01 | Les établissements doivent pouvoir ajouter leurs projets et partenariats sans connaissances techniques ni navigation dans un espace d'administration complexe |
| ENF-02 | Les relations complexes entre entités restent invisibles : pour associer plusieurs partenaires à un projet, l'utilisateur les sélectionne simplement dans une liste |
| ENF-03 | La gestion des partenaires et des partenariats est regroupée dans une même interface afin de limiter le nombre d'écrans |
| ENF-04 | Les statuts sont présentés sous une forme lisible par un utilisateur non technique (libellé explicite, pas de code) |

## 8.2. Sécurité

| Réf. | Exigence |
|---|---|
| ENF-05 | La plateforme garantit la séparation des données entre établissements : un établissement ne peut consulter ni modifier les informations privées d'un autre établissement |
| ENF-06 | Les documents et les archives sont accessibles uniquement aux utilisateurs autorisés |
| ENF-07 | L'accès aux espaces internes suppose une authentification ; l'espace public reste accessible sans compte |
| ENF-08 | Les droits de chaque rôle (Présidence, Établissement, Décideur, Visiteur) sont appliqués de manière uniforme sur l'ensemble des fonctionnalités |

## 8.3. Gestion des fichiers

| Réf. | Exigence |
|---|---|
| ENF-09 | Les documents et les photos sont stockés de manière sécurisée et rattachés à l'élément concerné |
| ENF-10 | Les formats acceptés et les limites de taille sont définis lors de la conception technique, puis validés par la maîtrise d'ouvrage (voir F22) |

## 8.4. Performance

| Réf. | Exigence |
|---|---|
| ENF-11 | La plateforme offre des temps de réponse acceptables lors des opérations courantes, y compris lorsque le volume de données augmente |
| ENF-12 | Les listes longues (projets, partenaires, conventions, documents) restent exploitables : recherche, filtres et affichage par pages |

## 8.5. Maintenabilité et évolutivité

| Réf. | Exigence |
|---|---|
| ENF-13 | La plateforme est conçue pour permettre l'ajout ultérieur de nouvelles fonctionnalités ou informations, sans remettre en cause son fonctionnement général |
| ENF-14 | La structure définitive des informations relatives aux bailleurs doit pouvoir être consolidée ultérieurement sans reprise complète du module |

## 8.6. Fiabilité des notifications automatiques

| Réf. | Exigence |
|---|---|
| ENF-15 | Le système de notifications fonctionne de manière fiable et permet la détection périodique des échéances importantes |
| ENF-16 | Les mécanismes automatiques analysent les dates de validité des conventions ainsi que les dates prévues des activités et des projets |
| ENF-17 | Le système limite la répétition excessive des notifications concernant un même événement |

## 8.7. Exigences complémentaires à confirmer par la maîtrise d'ouvrage

Le document v4 ne traite pas les points suivants ; ils sont proposés à la validation plutôt que supposés :

| Réf. | Sujet | Renvoi |
|---|---|---|
| ENF-18 | Journalisation des actions (qui a modifié quoi, quand) pour les données sensibles | F13 |
| ENF-19 | Sauvegarde et conservation des données et des fichiers (durée, fréquence, restauration) | F14 |
| ENF-20 | Accessibilité de l'interface (navigation au clavier, contraste, libellés) | À valider |
| ENF-21 | Navigateurs et matériels pris en charge par la plateforme | À valider |

---

# 9. Recette fonctionnelle attendue

Les scénarios ci-dessous permettent de vérifier la plateforme de bout en bout, sans connaissance technique. Ils découlent des besoins du chapitre 4 et des parcours du chapitre 6.

| Réf. | Scénario | Étapes principales | Résultat attendu |
|---|---|---|---|
| REC-01 | Création d'un partenaire par un établissement | Rechercher un partenaire existant par son nom, puis le créer avec ses caractéristiques et ses contacts | Le partenaire apparaît dans les listes de l'établissement, avec ses contacts ; il est visible par l'équipe Projet et Partenariat |
| REC-02 | Cloisonnement entre établissements | Se connecter avec le compte d'un premier établissement, puis avec celui d'un second | Chaque établissement ne voit que ses propres partenaires, partenariats, projets, documents et archives |
| REC-03 | Création d'un partenariat | Sélectionner plusieurs établissements et plusieurs partenaires, saisir intitulé, objet, domaine, dates, statut et les six champs narratifs | Le partenariat est enregistré avec ses associations et ses textes de suivi |
| REC-04 | Projet rattaché à un partenariat | Créer un projet en sélectionnant le partenariat, puis vérifier la fiche du partenariat | Le projet apparaît dans les projets du partenariat ; le projet ne référence qu'un seul partenariat |
| REC-05 | Projet autonome avec partenaires propres | Créer un projet sans partenariat, avec plusieurs partenaires propres, bénéficiaires, sites, bailleurs et un porteur | Le projet existe de façon autonome et affiche l'ensemble de ses associations |
| REC-06 | Avancement calculé par les activités | Créer trois activités, en cocher deux, puis en décocher une | L'avancement passe à 67 % puis à 33 % ; le statut du projet reste inchangé |
| REC-07 | Chronogramme d'une activité | Saisir plusieurs entrées de suivi (année, trimestre, mois, nombre de jours) pour une même activité | Les entrées sont enregistrées et affichées ; l'avancement du projet n'est pas modifié |
| REC-08 | Documents et versions | Déposer un terme de référence, puis le remplacer par une nouvelle version | La première version est conservée comme archivée et reste téléchargeable |
| REC-09 | Convention et circuit de traitement | Créer une convention rattachée à un projet, renseigner puis modifier l'étape du circuit et la date de changement | L'étape courante et sa date sont affichées sur la fiche de la convention |
| REC-10 | Expiration d'une convention | Placer une convention à quelques jours de sa date de fin, attendre la vérification périodique | Une notification d'expiration est reçue ; au-delà de la date de fin, la convention apparaît expirée et une notification est émise |
| REC-11 | Retard d'activité et de projet | Créer une activité non terminée avec une échéance passée, et un projet non terminé dont la date de fin prévue est dépassée | L'activité et le projet sont signalés en retard et génèrent chacun une notification |
| REC-12 | Notification d'ajout par un établissement | Avec un compte établissement, créer un partenaire, un partenariat et un projet | L'équipe Projet et Partenariat reçoit les notifications correspondantes et accède à l'élément depuis la notification |
| REC-13 | Traitement des notifications | Ouvrir une notification, accéder à l'élément concerné, la marquer comme lue | L'élément s'ouvre directement ; la notification passe en « lue » et reste distincte des nouvelles |
| REC-14 | Publication destinée au public | Créer une publication pour un projet, ajouter plusieurs photos avec légende et ordre, publier | La publication devient visible dans l'espace public avec ses photos ; en brouillon, elle reste invisible |
| REC-15 | Espace public | Parcourir les six rubriques sans être connecté | Seules les publications publiées et les informations publiques des partenaires et établissements sont visibles ; aucune donnée de gestion n'apparaît |
| REC-16 | Archives | Archiver un partenariat devenu inactif, puis le rechercher | L'élément archivé reste consultable avec ses informations ; la Présidence voit toutes les archives, l'établissement seulement les siennes |
| REC-17 | Tableaux de bord | Ouvrir successivement les tableaux de bord Présidence, Établissement et Décideur | Les indicateurs affichés correspondent au périmètre de chaque rôle et aux données enregistrées |
| REC-18 | Synthèse annuelle | Générer la synthèse d'un établissement pour une année, saisir les éléments narratifs et désigner des partenaires stratégiques | Les compteurs correspondent aux données de l'année sans ressaisie ; les éléments narratifs sont enregistrés |
| REC-19 | Recherche et filtres | Rechercher un élément par son nom ; filtrer les projets par statut, période et avancement ; filtrer les conventions par statut et date d'expiration | Chaque recherche et chaque filtre réduit effectivement la liste et respecte le périmètre du rôle |
| REC-20 | Reprise du suivi Excel | Comparer, pour un même partenariat, les informations de la plateforme et celles du fichier `Partenaires_Universites` | Les champs narratifs et les informations de suivi correspondent à ceux utilisés aujourd'hui par l'équipe |

**Critère de réception fonctionnelle** : l'ensemble des scénarios ci-dessus est exécuté avec succès, et chacun des besoins marqués **doit** au chapitre 4 est vérifié. Les besoins marqués **peut** et les points marqués **à préciser** font l'objet d'une décision explicite de la maîtrise d'ouvrage (chapitre 10) avant réception.

---

# 10. Points à valider avec l'équipe Projet et Partenariat

Ces questions ne sont pas tranchées par le document v4. Elles sont posées ici plutôt que supposées : chaque réponse complétera le présent cahier des charges.

| Réf. | Question à trancher | Incidence |
|---|---|---|
| F1 | Les activités et le chronogramme (suivi des jours par mois et par trimestre) doivent-ils être mis en œuvre sur la plateforme, ou la pratique est-elle abandonnée ? | Cœur du suivi projet (RG11 à RG13, RG38, RG39) |
| F2 | Le circuit de traitement d'une convention (Projet et Partenariat, Secrétaire principale, Direction des Affaires Juridiques, Signature) doit-il être suivi dans la plateforme ? Si oui, quelles étapes nommées et quelles dates de changement ? | RG22, fiche convention |
| F3 | Les établissements doivent-ils gérer eux-mêmes leurs conventions, documents et publications, comme indiqué au tableau de répartition de la section 12 de la version 4 ? | Droits d'accès, RG05, RG23, RG25 |
| F4 | Un établissement doit-il pouvoir créer ses propres bailleurs, bénéficiaires, porteurs et sites, ou cette création reste-t-elle réservée à l'équipe Projet et Partenariat ? | Module des référentiels |
| F5 | Quelle règle d'unicité appliquer aux partenaires : par établissement ou au niveau de l'Université entière ? | RG16, recherche de doublon |
| F6 | Quelle devise et quel format d'affichage pour le budget des projets ? | BF-PRO-12 |
| F7 | Les comptes doivent-ils être strictement uniques par établissement (RG02) ? Qui les crée et selon quelle procédure administrative ? | RG01, RG02, hors périmètre fonctionnel |
| F8 | Le formulaire de contact public doit-il enregistrer les messages et à qui doivent-ils être adressés ? | BF-EPU-06 |
| F9 | La synthèse annuelle doit-elle être exportable (document imprimable, tableur) et selon quel modèle de présentation officiel ? | BF-SYN-07 |
| F10 | Quels sont les seuils d'alerte retenus avant expiration d'une convention (30, 15, 7 jours ou autres), et à partir de quel délai une convention est-elle « bientôt expirée » sur le tableau de bord ? | RG36, BF-TDB-05, BF-NTF-04 |
| F11 | Qui doit être destinataire des alertes : équipe Projet et Partenariat, établissement concerné, Décideur ? | RG42, BF-NTF-13 |
| F12 | Quel contenu exact doit apparaître sur la vitrine publique (coordonnées des partenaires, montants des projets, statistiques présentées, logo officiel) ? | BF-EPU-02, BF-EPU-07 |
| F13 | Faut-il une journalisation des actions retraçant qui a modifié quoi et quand ? | ENF-18 |
| F14 | Quelles sont les exigences de sauvegarde et de conservation des données et des fichiers ? | ENF-19 |
| F15 | Comment un utilisateur interne renouvelle-t-il son mot de passe en cas d'oubli ? | BF-AUT-05 |
| F16 | Qui alimente et met à jour la liste des établissements (nom, sigle, logo, description) ? | BF-ETA-04 |
| F17 | Quelles sont les valeurs officielles des statuts d'un partenaire, d'un partenariat et d'un projet, et qui peut les modifier ? | BF-PAR-10, BF-PTR-08, BF-PRO-11 |
| F18 | Les établissements, partenaires, bénéficiaires, bailleurs et sites associés à un projet ou à un partenariat peuvent-ils être modifiés après sa création ? | BF-PTR-09, BF-PRO-13 |
| F19 | Quel critère déclenche l'archivage d'un élément (« qui ne sont plus actifs ») et un élément archivé peut-il être remis en service ? Les archives doivent-elles apparaître dans la recherche générale ? | BF-ARC-05, BF-REC-05, RG26 |
| F20 | Qui dépose et met à jour les logos (établissement, partenaire, Université) et sous quels formats ? | BF-LOG-03, BF-LOG-04 |
| F21 | L'étape du circuit de traitement d'une convention est-elle mise à jour dans la plateforme ou uniquement à l'extérieur, comme l'indique la règle RG22 ? | BF-CNV-04, BF-CNV-08 |
| F22 | Quels formats de fichiers et quelles limites de taille doit-on accepter pour les documents et les photos ? | ENF-10, BF-DOC-06 |
| F23 | Quelle présentation du chronogramme est attendue (grille annuelle par mois, vue par trimestre, cumul de jours) et sur quelle période la saisie est-elle ouverte ? | BF-ACT-12 |
| F24 | Quelles modifications doivent déclencher une notification (RG35) et comment limiter la répétition des alertes pour un même événement ? | BF-NTF-02, BF-NTF-14 |

---

# 11. Glossaire

| Terme | Définition retenue |
|---|---|
| **Activité** | Composante d'un projet, dotée d'un intitulé, d'un état terminé ou non et d'une échéance éventuelle ; elle sert au calcul de l'avancement |
| **Archivage** | Retrait d'un élément de la gestion courante sans suppression définitive : l'élément reste consultable |
| **Avancement** | Pourcentage calculé automatiquement à partir du nombre d'activités terminées rapporté au nombre total d'activités du projet |
| **Bailleur** | Organisme qui finance un projet |
| **Bénéficiaire** | Structure ou entité qui bénéficie d'un projet |
| **Chronogramme** | Suivi périodique d'une activité en nombre de jours, par année, trimestre et mois |
| **Circuit de traitement** | Étapes internes parcourues par une convention avant sa signature (par exemple Projet et Partenariat, Secrétaire principale, Direction des Affaires Juridiques, Signature) |
| **Contact** | Personne référente rattachée à un partenaire |
| **Convention** | Acte juridique rattaché à un partenariat, un projet ou une cotutelle, avec sa référence, ses dates et son statut |
| **Cotutelle de thèse** | Collaboration académique entre un établissement malgache et une université partenaire portant sur la thèse d'un doctorant (co-tutelle ou co-encadrement) |
| **Décideur** | Utilisateur interne disposant d'une vue globale en lecture seule (par exemple le Président de l'Université) |
| **Document** | Fichier associé à un projet ou à une convention (termes de référence, description de projet, convention), avec historique des versions |
| **Établissement** | Structure existante de l'Université participant aux partenariats et portant des projets |
| **Partenariat** | Relation de collaboration entre un ou plusieurs établissements et un ou plusieurs partenaires, pouvant regrouper plusieurs projets |
| **Partenaire** | Organisation externe (entreprise, institution, organisme, université) en relation avec l'Université |
| **Porteur** | Personne responsable d'un projet |
| **Publication** | Contenu destiné à l'espace public pour un projet donné, avec ses photos, distinct des données de gestion |
| **Référentiel** | Liste d'éléments réutilisables : bailleurs, bénéficiaires, porteurs, sites |
| **Site** | Lieu où un projet est appliqué ou réalisé |
| **Synthèse annuelle** | État annuel de l'activité de coopération, produit par établissement : compteurs calculés automatiquement et éléments narratifs saisis par l'équipe |
| **Visibilité** | Caractère public ou privé d'un partenaire, déterminant son affichage dans l'espace public |

---

# 12. Annexes

## 12.1. Annexe A — Traçabilité des règles de gestion vers les besoins

| Règle | Besoins fonctionnels concernés |
|---|---|
| RG01, RG02, RG03 | BF-AUT-01, BF-AUT-02, BF-AUT-03 |
| RG04 | BF-AUT-04, BF-EPU-01 |
| RG05 | BF-ACC-01, BF-ESP-01, BF-ESP-03, BF-ETA-03, BF-ARC-02 |
| RG06 | BF-ACC-02, BF-ESP-02 |
| RG07 | BF-ACC-03 |
| RG08 | BF-PRO-02 |
| RG09 | BF-PRO-03 |
| RG10 | BF-REF-01 |
| RG11 | BF-ACT-01 |
| RG12 | BF-ACT-08, BF-ACT-09 |
| RG13 | BF-ACT-03, BF-ACT-04, BF-PRO-10, BF-REC-02 |
| RG14 | BF-PRO-06, BF-REF-04 |
| RG15 | BF-PRO-07, BF-REF-03 |
| RG16 | BF-PAR-08, BF-ETA-03 |
| RG17 | BF-PTR-01, BF-PTR-07 |
| RG18 | BF-PTR-01, BF-PTR-06 |
| RG19 | BF-PRO-04, BF-PRO-05 |
| RG20 | BF-COT-01, BF-COT-02 |
| RG21 | BF-CNV-01, BF-COT-04 |
| RG22 | BF-CNV-04, BF-CNV-08, CP-05 |
| RG23 | BF-CNV-06 |
| RG24 | BF-DOC-03, BF-DOC-04 |
| RG25 | BF-DOC-01, BF-DOC-02, BF-DOC-04 |
| RG26 | BF-ARC-03, BF-CNV-06 |
| RG27 | BF-ETA-02, BF-PAR-03, BF-LOG-01, BF-LOG-02 |
| RG28 | BF-PAR-06, BF-PAR-07 |
| RG29 | BF-PUB-03, BF-PUB-04 |
| RG30 | BF-PUB-05, BF-EPU-03, BF-EPU-05 |
| RG31 | BF-ACC-05, BF-PAR-05, BF-EPU-04 |
| RG32 | BF-ACC-04, BF-TDB-04 |
| RG33 | BF-ETA-01 |
| RG34 | BF-NTF-01 |
| RG35 | BF-NTF-02 |
| RG36 | BF-CNV-05, BF-NTF-03, BF-NTF-04 |
| RG37 | BF-CNV-05, BF-NTF-05 |
| RG38 | BF-ACT-07, BF-NTF-06 |
| RG39 | BF-ACT-06, BF-NTF-07 |
| RG40 | BF-PRO-09, BF-NTF-08 |
| RG41 | BF-NTF-10 |
| RG42 | BF-NTF-13 |
| RG43 | BF-NTF-12 |
| RG44 | BF-SYN-01, BF-SYN-02, BF-SYN-03, BF-SYN-04, BF-ACT-10 |

## 12.2. Annexe B — Correspondance avec le cahier des charges version 4

| Section du document v4 | Reprise dans le présent document |
|---|---|
| 1.1 à 1.2 (contexte, problématique) | Chapitre 1 |
| 2 (objectifs) | Chapitre 1, sections 1.3 et 1.4 |
| 3 (périmètre, acteurs) | Chapitre 3, section 3.1 |
| 4 (comptes et droits d'accès) | Chapitre 3, section 3.2 |
| 5.1 à 5.22 (besoins fonctionnels) | Chapitre 4, sections 4.1 à 4.18 — l'ordre d'exposition suit le déroulé du métier, le renvoi est indiqué dans chaque section |
| 6 (règles de gestion RG01 à RG44) | Chapitre 5, reprises mot pour mot |
| 7 et 7.1 (modèle de données prévisionnel) | Non repris ici : le modèle de données est un élément de conception, traité dans le document d'analyse technique joint. Les règles qu'il porte sont couvertes par le chapitre 4 |
| 8 (relations principales) | Chapitre 4 (RG14 à RG21) et document d'analyse technique |
| 9 (parcours utilisateurs) | Chapitre 6 |
| 10 (description des écrans) | Chapitre 7 |
| 11 (exigences non fonctionnelles) | Chapitre 8 |
| 12 (répartition selon les acteurs) | Chapitre 3, section 3.3 |
| 13 (synthèse du fonctionnement) | Chapitre 6, section 6.5 |

## 12.3. Annexe C — Documents liés

| Document | Rôle |
|---|---|
| `cahier-des-charges-fonctionnel.md` | Présent document : expression des besoins du client (chapitre 4, règles de gestion, parcours, écrans, recette) |
| `cahier-des-charges-v5.md` | Document d'analyse technique : description du logiciel, de son architecture et de son état d'implémentation, avec les écarts constatés. Il ne remplace pas le présent cahier des charges fonctionnel |
| `Cahier des de charges.pdf` | Cahier des charges version 4 fourni par la maîtrise d'ouvrage : source du présent document |
| Export PDF du présent document | Produit par l'outil `outils/markdown-vers-pdf.py` : `python3 outils/markdown-vers-pdf.py docs/cahier-des-charges-fonctionnel.md docs/Cahier_des_charges_fonctionnel_v5.pdf` |

## 12.4. Historique des versions

| Version | Date | Contenu |
|---|---|---|
| 1 à 3 | — | Versions intermédiaires antérieures, non fournies |
| 4 | 16/10/2026 | Version consolidée à partir des échanges avec l'équipe Projet et Partenariat : périmètre, besoins fonctionnels, 44 règles de gestion, modèle de données prévisionnel, parcours, écrans, exigences non fonctionnelles |
| 5 (document fonctionnel) | 16/10/2026 | Présent document : reprise intégrale des besoins de la version 4, structuration en besoins vérifiables (références BF), rattachement de chaque besoin à ses règles de gestion, ajout des vérifications attendues, des scénarios de recette, du glossaire et de la liste des points à trancher |

**Note de méthode** : ce document ne contient aucun besoin nouveau par rapport au cahier des charges version 4. Il en explicite le contenu sous une forme vérifiable et signale, sans les supposer, les points que la version 4 laisse ouverts (chapitre 10). Toute décision prise sur ces points doit être reportée dans ce document, qui devient alors la référence de la version en cours.
