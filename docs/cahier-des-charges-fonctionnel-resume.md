# PLATEFORME DE GESTION ET DE SUIVI DES PROJETS ET PARTENARIATS DE L'UNIVERSITÉ DE FIANARANTSOA

## Cahier des charges fonctionnel — version condensée

**Version 5 — expression des besoins de la maîtrise d'ouvrage**

---

## Fiche du document

| Élément | Valeur |
|---|---|
| Intitulé et nature | Cahier des charges fonctionnel — version condensée : expression des besoins fonctionnels de la plateforme de gestion et de suivi des projets et partenariats |
| Maître d'ouvrage | Université de Fianarantsoa — équipe Projet et Partenariat (Présidence) |
| Sources | Cahier des charges version 4 (14 pages, 16/10/2026) et analyse du logiciel consignée dans `cahier-des-charges-v5.md` |
| Relation avec la version complète | Version condensée de `cahier-des-charges-fonctionnel.md` : mêmes besoins (BF), mêmes règles (RG01 à RG44), mêmes scénarios de recette ; le détail et la traçabilité figurent dans la version complète |
| Règle appliquée | Aucun besoin non exprimé par la maîtrise d'ouvrage n'est inventé ; les points non tranchés par le document v4 sont marqués **à préciser** et renvoyés au chapitre 9 |
| Date | 16 octobre 2026 |

**Références** : `BF-XXX-nn` = besoin fonctionnel ; `RG-nn` = règle de gestion du document v4 ; `ENF-nn` = exigence non fonctionnelle ; `REC-nn` = scénario de recette ; `F-nn` = question à trancher.

---

## Sommaire

<!-- TOC -->

---

# 1. Objet, périmètre et résultats attendus

## 1.1. Contexte et problématique

*(Repris du cahier des charges version 4.)*

L'Université de Fianarantsoa conduit des partenariats avec des entreprises, des institutions, des organismes et des universités, qui donnent lieu à des projets en formation, recherche, innovation, développement et coopération institutionnelle. Ses établissements disposent de leurs propres partenaires, partenariats et projets, dont les informations doivent remonter au niveau central ; l'équipe Projet et Partenariat de la Présidence en assure la vision globale, le suivi des cotutelles de thèses, la conservation des conventions et la synthèse nationale. La question à résoudre : mettre en place une plateforme web simple et centralisée permettant aux établissements d'ajouter leurs projets et partenariats, tout en permettant à la Présidence d'en assurer la gestion, le suivi, la consultation et l'archivage.

## 1.2. Résultats attendus à la mise en service

| Réf. | Résultat attendu | Réf. | Résultat attendu |
|---|---|---|---|
| RE-01 | Partenaires, partenariats, cotutelles et projets enregistrés et consultables dans une base unique partagée | RE-05 | Le Décideur dispose d'une vue de consultation et les visiteurs d'un accès aux informations publiques |
| RE-02 | Chaque projet conserve : nom, intitulé officiel, type, domaine, durée, budget total, porteur, bailleur(s), bénéficiaires, sites | RE-06 | Les établissements disposent d'un espace de gestion minimal et séparé, sans compétence technique requise |
| RE-03 | Activités et chronogramme mensuel et trimestriel en jours suivis, documents associés gérés, conventions signées archivées | RE-07 | Un système de notifications informe : ajout par un établissement, conventions proches de l'expiration ou expirées, activités et projets en retard |
| RE-04 | L'équipe Projet et Partenariat dispose d'une vision globale et d'une synthèse annuelle par établissement calculée automatiquement | RE-08 | Le suivi réalisé dans les fichiers Excel et dans le fichier `Synthese_national` est remplacé, sans perte d'information |

## 1.3. Périmètre

**Dans le périmètre** : partenaires et contacts ; partenariats ; cotutelles de thèses ; projets (porteurs, bailleurs, bénéficiaires, sites, activités) ; avancement et chronogramme ; documents avec historique des versions ; conventions (cycle de vie, circuit avant signature, validité, archivage) ; archivage ; publications avec photos ; synthèse annuelle ; tableaux de bord ; recherche et filtrage ; notifications ; espace public ; espace de gestion de l'établissement.

**Hors périmètre, avec le motif exprimé** :

| Élément exclu | Motif |
|---|---|
| Gestion administrative des établissements | Structures existantes de l'Université (RG33) |
| Création et administration des comptes | Relève de l'administration technique, hors périmètre fonctionnel |
| Saisie par les visiteurs | L'intégration de la saisie établissement aux pages publiques a été écartée (mélange de données validées et non validées) |
| Facturation, comptabilité, gestion budgétaire | Non exprimé ; le budget d'un projet est une information descriptive |
| Messagerie interne entre utilisateurs | Non exprimé ; seules les notifications sont prévues |

**Contraintes et hypothèses** : application web en français (CP-01, CP-02) ; un compte par utilisateur interne, rattaché à un rôle (CP-03) ; les fichiers `Partenaires_Universites` et `Synthese_national` font référence pour les informations à reprendre (CP-04) ; le circuit de convention se déroule hors plateforme, seule l'étape courante étant enregistrée (CP-05, à préciser — F21) ; volume d'utilisateurs internes limité (CP-06) ; aucun échange automatique avec un autre système d'information (CP-07).

---

# 2. Acteurs, comptes et droits

## 2.1. Les quatre acteurs

| Acteur | Rôle |
|---|---|
| **Équipe Projet et Partenariat (Présidence)** | Gestionnaire fonctionnel : vision globale et gestion des partenaires, partenariats, cotutelles, projets, conventions, documents, archives et publications ; production de la synthèse annuelle |
| **Établissement** | Compte unique et espace de gestion minimal séparé de l'espace public, limité à ses propres partenaires, partenariats et projets ; aucune consultation ni modification des données d'un autre établissement |
| **Décideur** | Vue globale en lecture seule (indicateurs agrégés et détail des fiches), sans opération courante de gestion |
| **Visiteur** | Sans compte ; accès aux seules informations rendues publiques |

## 2.2. Comptes et accès

**BF-AUT-01 à 04** — Authentification par identifiant et mot de passe ; après connexion, détermination automatique du rôle et orientation vers l'espace correspondant. Un compte unique pour la Présidence, un compte unique par établissement associé à un seul établissement, un ou plusieurs comptes Décideur sans rattachement ; le visiteur accède aux informations publiques sans compte (RG01, RG02, RG03, RG04). **BF-AUT-05 à préciser** : modalités de renouvellement ou de récupération d'un mot de passe (F15).

## 2.3. Droits par fonctionnalité

| Fonctionnalité | Présidence | Établissement | Décideur | Visiteur |
|---|---|---|---|---|
| Partenaires et partenariats | Tous, gestion complète | Les siens | Consultation | Publics uniquement |
| Cotutelles de thèses | Gestion complète | — | Consultation | — |
| Projets | Tous, gestion complète | Les siens | Consultation | Publiés uniquement |
| Activités, avancement, chronogramme | Tous | Les siens | Consultation | — |
| Conventions et circuit | Gestion complète | Les siennes | Consultation | — |
| Documents | Gestion complète | Les siens | — | — |
| Archives | Toutes | Les siennes | — | — |
| Publications | Gestion complète | Les siennes | Consultation | Publiées uniquement |
| Synthèse annuelle | Génération et complément narratif | — | Consultation | — |
| Recherche et filtrage | Oui | Ses données | Oui | Données publiques |
| Tableau de bord | Global | Son établissement | Global, détail en lecture seule | — |
| Notifications | Oui | Ses données | — | — |

## 2.4. Règles de cloisonnement

| Réf. | Règle |
|---|---|
| BF-ACC-01, 02 | Un établissement ne peut ni consulter ni modifier les informations d'un autre ; les informations qu'il crée sont automatiquement rattachées à lui, sans saisie (RG05, RG06) |
| BF-ACC-03 | L'équipe Projet et Partenariat dispose d'une vision globale de toutes les informations enregistrées (RG07) |
| BF-ACC-04 | Le Décideur n'a aucun droit de création, de modification ni de suppression : accès strictement consultatif (RG32) |
| BF-ACC-05 | Les informations publiques sont séparées des informations internes ou confidentielles (RG30, RG31) |

---

# 3. Besoins fonctionnels

Les besoins sont exprimés par domaine, dans l'ordre du métier. Les références `BF-xxx-nn` renvoient à la version complète, où chaque besoin est détaillé avec sa vérification attendue.

## 3.1. Établissements et espace de gestion de l'établissement

**BF-ETA-01 à 03** — Les établissements sont des structures déjà existantes de l'Université : leur gestion administrative ne fait pas partie du périmètre de l'équipe Projet et Partenariat. Chaque établissement est décrit par un nom, un sigle éventuel, un logo et une description, et son rattachement conditionne la visibilité et les droits de consultation et de modification des partenaires, partenariats et projets (RG05, RG06, RG16, RG27, RG33). Aucun écran de création ou de modification d'établissement n'est attendu. **BF-ETA-04 à préciser** : qui alimente et met à jour la liste des établissements (F16).

**BF-ESP-01 à 05** — L'établissement authentifié dispose d'un espace dédié et minimal, distinct de l'espace public, organisé autour de deux besoins : consulter la liste de ses propres partenaires, partenariats et projets, et en ajouter ou en modifier. Les informations créées y sont automatiquement rattachées à l'établissement du compte connecté, sans saisie de sa part, afin d'éviter toute erreur de rattachement ; un établissement ne peut ni consulter ni modifier les informations d'un autre (RG05, RG06). L'espace ne demande aucune compétence technique : les associations entre entités restent invisibles, l'utilisateur sélectionne les éléments concernés dans une liste ; la saisie n'est pas intégrée aux pages publiques (section 11.1 du document v4).

## 3.2. Partenaires et contacts

**BF-PAR-01 à 08** — Un établissement enregistre ses propres partenaires et met à jour leurs informations ; l'équipe Projet et Partenariat gère l'ensemble des partenaires (RG05, RG07). Une recherche de partenaire existant est proposée avant toute création, afin d'éviter les doublons. Un partenaire est caractérisé par son nom, son logo, son type, son pays, son adresse, ses coordonnées, son site web éventuel, sa description, son statut, sa visibilité (public ou privé) et un indicateur « partenaire stratégique » repris par la synthèse (RG27). Sa visibilité détermine son affichage dans l'espace public : un partenaire privé n'est pas publié (RG31). Chaque partenaire peut être associé à un ou plusieurs contacts (nom, fonction, e-mail, téléphone) et un contact est rattaché à un seul partenaire (RG28). Un partenaire est rattaché à un établissement et peut participer à plusieurs partenariats, cotutelles de thèses et projets (RG16). **BF-PAR-09, 10 à préciser** : unicité du nom des partenaires, par établissement ou au niveau de l'Université (F5) ; liste des statuts possibles d'un partenaire (F17).

## 3.3. Partenariats

**BF-PTR-01 à 07** — Le partenariat est une entité distincte du partenaire : il représente une relation de collaboration entre un ou plusieurs établissements de l'Université et un ou plusieurs partenaires, et peut regrouper plusieurs projets (RG17, RG18). Il comporte un intitulé, un objet, un domaine de collaboration, les dates de début et de fin, un statut et les établissements et partenaires concernés, ainsi que six champs de suivi narratif renseignés librement par l'équipe : actions déjà réalisées, actions en cours, actions prévues, résultats obtenus, difficultés ou contraintes rencontrées, perspectives ou recommandations ; ce sont des textes rédigés par l'équipe, non des statuts calculés à partir des projets. La gestion des partenaires et des partenariats est regroupée dans une même interface : l'utilisateur sélectionne ou ajoute les partenaires concernés, puis renseigne les informations du partenariat (section 11.1 du document v4). Un partenariat peut comporter plusieurs projets ; un projet n'est rattaché qu'à un seul partenariat au plus, ou à aucun (RG18). **BF-PTR-08, 09 à préciser** : statuts d'un partenariat et règles de passage (F17) ; modification des établissements et partenaires associés après création (F18).

## 3.4. Cotutelles de thèses

**BF-COT-01 à 05** — La cotutelle de thèse est un type de collaboration académique distinct, associée à un doctorant précis et à une université partenaire. Elle comporte l'établissement malgache, l'université partenaire, le nom du doctorant, sa spécialité, le directeur de thèse local, le directeur de thèse partenaire, le type (co-tutelle ou co-encadrement), la date de début, la date prévisionnelle de soutenance, le financement ou la bourse, la mobilité réalisée, les publications produites, l'état d'avancement, les difficultés rencontrées et les perspectives (RG20). Une cotutelle peut être associée à une convention, sur le même principe que les partenariats et les projets (RG21). La gestion relève de l'équipe Projet et Partenariat, le Décideur y accède en consultation, l'Établissement n'y a pas accès.

## 3.5. Projets

**BF-PRO-01 à 10** — Un projet comporte un nom, un intitulé officiel (information distincte du nom), un type ou domaine, un budget total, une date de début, une date de fin, un statut, un établissement responsable, un partenariat concerné (facultatif), un porteur, un ou plusieurs bailleurs, un ou plusieurs partenaires propres, un ou plusieurs bénéficiaires, un ou plusieurs sites, plusieurs activités, une convention éventuelle et une publication éventuelle ; le budget, le type et le statut sont directement enregistrés comme attributs du projet (RG08, RG09, RG14, RG15, RG19). Un projet n'est pas obligatoirement rattaché à un partenariat : il peut exister de façon autonome, avec ses propres partenaires directement associés, en complément ou en l'absence de partenariat (RG19). Les sites et les bénéficiaires sont sélectionnés simplement dans une liste ou par cases à cocher ; un site ou un bénéficiaire peut servir plusieurs projets (RG14, RG15). La durée et les dates prévues permettent de suivre le respect du calendrier : lorsqu'un projet dépasse sa date de fin prévue sans être terminé, la plateforme l'identifie comme étant en retard et génère une notification (RG40). Les activités déterminent l'avancement, qui reste indépendant du statut du projet (RG13). **BF-PRO-11 à 13 à préciser** : statuts d'un projet et règles de passage (F17) ; devise et format du budget (F6) ; modification des listes associées après création (F18).

## 3.6. Porteurs, bailleurs, bénéficiaires et sites

**BF-REF-01 à 04** — Le porteur représente la personne responsable du projet ; les informations identifiées comprennent son nom et son institution de rattachement (RG10). La plateforme conserve les informations relatives aux bailleurs intervenant dans le financement des projets ; leur structure définitive reste à consolider au fil de l'usage et comporte a minima un nom et une description (section 11.5 du document v4). Un projet peut être associé à plusieurs bénéficiaires et un même bénéficiaire à plusieurs projets, la sélection se faisant à partir d'une liste ou de cases à cocher (RG15). Le site représente le lieu où le projet est appliqué ou réalisé : entité indépendante, liée aux projets par une relation d'association, un projet pouvant concerner plusieurs sites et un site pouvant servir plusieurs projets (RG14). **BF-REF-05 à préciser** : qui crée et met à jour ces référentiels — établissement ou Présidence (F4).

## 3.7. Activités, avancement et chronogramme

**BF-ACT-01 à 07** — Chaque projet est décomposé en plusieurs activités ; une activité appartient à un seul projet et possède un intitulé et un état terminé ou non, matérialisé par une case à cocher (RG11). L'avancement du projet est calculé automatiquement : nombre d'activités terminées divisé par le nombre total d'activités, multiplié par cent ; le statut du projet reste indépendant du pourcentage d'avancement (RG13). Chaque activité peut comporter une échéance permettant de suivre le respect du calendrier ; lorsque cette échéance est dépassée sans que l'activité soit terminée, l'activité est considérée comme en retard et fait l'objet d'une notification, et une alerte peut être émise lorsque l'échéance approche (RG38, RG39).

**BF-ACT-08 à 10** — Indépendamment de la case à cocher « terminée », chaque activité fait l'objet d'un suivi périodique détaillé correspondant à la pratique actuelle de l'équipe : le nombre de jours effectivement consacrés à l'activité, par année, trimestre et mois. Une activité peut posséder plusieurs entrées de chronogramme, une par mois suivi (RG12). Ce suivi en jours est indépendant du calcul automatique d'avancement et n'alimente pas automatiquement la synthèse nationale : les deux mécanismes coexistent, à des fins différentes. **BF-ACT-11, 12 à préciser** : gestion par la Présidence pour tous les projets et par chaque établissement pour les siens, consultation par le Décideur ; présentation attendue du chronogramme et période de saisie ouverte (F23).

## 3.8. Documents

**BF-DOC-01 à 05** — La plateforme conserve les documents associés aux projets et aux conventions, notamment les termes de référence, les descriptions de projet et les conventions elles-mêmes ; un document est rattaché directement à un projet ou à une convention selon sa nature (RG25). Lorsqu'un nouveau document remplace un document existant, l'ancienne version n'est pas supprimée : elle est conservée à l'état archivé et reste téléchargeable, comme la version courante, par les utilisateurs autorisés (RG24). La gestion complète relève de l'équipe Projet et Partenariat, un établissement accède à ses propres documents, le Décideur n'y a pas accès. **BF-DOC-06 à préciser** : formats de fichiers et limites de taille acceptés (F22).

## 3.9. Conventions

**BF-CNV-01 à 07** — Une convention est une entité indépendante, associée à un partenariat, un projet ou une cotutelle de thèse selon le contexte (RG21), et comporte une référence, un titre, une date de signature, une date de début, une date de fin, un statut et une description. Les statuts possibles sont notamment : En préparation, En attente de signature, Signée, Active, Suspendue, Expirée et Archivée. Avant sa signature, une convention suit un circuit de traitement interne (par exemple : Projet et Partenariat, Secrétaire principale, Direction des Affaires Juridiques, Signature), l'étape courante et la date du dernier changement étant enregistrées et mises à jour manuellement par l'équipe (RG22). Le système assure un suivi automatique de la période de validité à partir des dates de début et de fin : il identifie les conventions approchant de leur expiration et celles dont la validité est dépassée, et les utilisateurs concernés reçoivent les notifications correspondantes (RG36, RG37). Les conventions signées peuvent être archivées et téléchargées ; l'archivage ne constitue pas une suppression définitive (RG23, RG26). La gestion relève de l'équipe Projet et Partenariat, un établissement accède aux siennes, le Décideur consulte. **BF-CNV-08 à préciser** : l'étape du circuit est-elle mise à jour dans la plateforme ou à l'extérieur (F21) ?

## 3.10. Archivage, logos et identité visuelle

**BF-ARC-01 à 05** — Les partenaires, partenariats, projets, cotutelles et conventions qui ne sont plus actifs peuvent être archivés, de même que les anciennes versions des documents. L'équipe Projet et Partenariat dispose d'un accès global aux archives ; un établissement ne consulte que les siennes (RG05). L'archivage ne constitue pas une suppression définitive : les éléments archivés restent consultables et retrouvables par recherche (RG26). **BF-ARC-05 à préciser** : critère déclenchant l'archivage d'un élément, remise en service éventuelle, présence des archives dans la recherche générale (F19).

**BF-LOG-01 à 04** — Chaque établissement et chaque partenaire possède un logo, affiché dans les fiches, les listes et les publications publiques (RG27). L'équipe Projet et Partenariat utilise le logo officiel de l'Université, élément fixe de l'identité visuelle de la plateforme. **BF-LOG-03, 04 à préciser** : qui dépose et met à jour les logos et sous quels formats (F20) ; le fichier du logo officiel de l'Université reste à fournir.

## 3.11. Publications

**BF-PUB-01 à 07** — Un projet peut faire l'objet d'une publication destinée à l'espace public ; la publication est une entité séparée du projet, afin de ne pas mélanger les données de gestion interne et le contenu de communication. Elle comporte un titre, une description publique, une date de publication, un statut (Brouillon ou Publiée), l'établissement concerné, les partenaires, les bénéficiaires et les résultats du projet, ainsi que plusieurs photos d'illustration avec légende et ordre d'affichage facultatifs (RG29). Un projet peut être associé à au plus une publication (RG29). Seule une publication au statut « Publiée » est visible par le visiteur (RG30) ; la page publique présente l'établissement et son logo, les partenaires et leurs logos, les bénéficiaires, la période et les résultats du projet. La gestion relève de l'équipe Projet et Partenariat, un établissement gère les siennes, le Décideur consulte, le visiteur ne voit que les publications publiées.

## 3.12. Recherche, filtrage et tableaux de bord

**BF-REC-01 à 04** — Une recherche rapide porte sur les partenaires, les partenariats, les cotutelles, les projets, les conventions et les archives. Les projets sont filtrables par établissement, partenaire, partenariat, type, statut, période et avancement ; les conventions par partenaire, partenariat, projet, statut, période et date d'expiration. Le périmètre dépend du rôle : la Présidence et le Décideur recherchent sur l'ensemble des données, un établissement sur ses propres données, le visiteur sur les données publiques (RG05, RG07, RG31, RG32). **BF-REC-05 à préciser** : les archives doivent-elles apparaître dans la recherche générale (F19) ?

**BF-TDB-01 à 04** — Chaque utilisateur interne dispose d'un tableau de bord adapté à son rôle. Celui de l'équipe Projet et Partenariat présente une vision globale : nombre de partenaires, de partenariats, de cotutelles, projets par statut, conventions actives, expirées et bientôt expirées. Celui d'un établissement présente uniquement ses propres données. Celui du Décideur privilégie les indicateurs globaux, avec accès possible au détail des fiches en lecture seule (RG32). **BF-TDB-05 à préciser** : délai à partir duquel une convention est considérée comme « bientôt expirée » (F10).

## 3.13. Synthèse annuelle

**BF-SYN-01 à 06** — La synthèse nationale annuelle, historiquement produite à la main dans le fichier `Synthese_national`, est générée automatiquement par établissement à partir des données enregistrées : nombre de partenaires, conventions actives et expirées, cotutelles, projets actifs. Les compteurs ne sont pas saisis manuellement, afin d'éviter toute donnée dupliquée ou périmée ; seuls les éléments narratifs sont saisis par l'équipe : principaux domaines, partenaires stratégiques (sélectionnés parmi les partenaires existants), défis majeurs et priorités futures (RG44). La synthèse est produite par établissement et couvre l'année demandée ; la génération et le complément narratif relèvent de l'équipe Projet et Partenariat, le Décideur consulte, l'Établissement n'y a pas accès. **BF-SYN-07 à préciser** : format de restitution attendu — consultation à l'écran, document exportable, modèle officiel de présentation (F9).

## 3.14. Notifications

**BF-NTF-01, 02** — Une notification est générée lorsque l'établissement ajoute un nouveau partenaire, un nouveau partenariat ou un nouveau projet, afin que l'équipe Projet et Partenariat prenne connaissance des informations enregistrées ; une notification peut également être générée lors d'une modification importante d'une information suivie (RG34, RG35). **À préciser** : notion de modification importante (F24).

**BF-NTF-03 à 08** — Le système surveille les dates de validité des conventions : lorsqu'une convention approche de sa date d'expiration, une notification est générée automatiquement ; plusieurs niveaux d'alerte peuvent être définis, par exemple trente, quinze ou sept jours avant l'échéance ; lorsqu'une convention dépasse sa date de fin de validité, le système indique automatiquement qu'elle est expirée et génère une notification (RG36, RG37). Il suit également les échéances des activités (alerte à l'approche de la date limite, alerte de retard lorsqu'une activité dépasse son échéance sans être marquée comme terminée) et les projets dépassant leur date de fin prévue sans être terminés (RG38, RG39, RG40).

**BF-NTF-09 à 14** — Chaque notification comporte un titre court, un message détaillé, un type, un niveau de priorité, une date et une heure de création, un état lu ou non lu et l'identification de l'élément concerné, permettant un accès direct à cet élément depuis la notification. Les notifications sont accessibles depuis un espace dédié et peuvent être marquées comme lues ou non lues, afin de distinguer les nouvelles alertes des notifications déjà consultées (RG41). Les notifications automatiques relatives aux expirations et aux retards sont produites par une vérification périodique, exécutée par exemple quotidiennement, portant sur les conventions, les activités et les projets (RG43) ; une notification est associée à l'utilisateur ou au groupe d'utilisateurs concerné (RG42) ; le système limite la répétition excessive des notifications concernant un même événement (section 11.6 du document v4). **BF-NTF-15** : accès de la Présidence et de l'établissement pour ses propres données ; le Décideur et le visiteur n'en ont pas.

## 3.15. Espace public

**BF-EPU-01 à 05** — L'espace public comporte les rubriques Accueil, À propos, Établissements, Partenaires, Projets et Partenariats et Contact. La page d'accueil présente le logo de l'Université, une présentation générale, des statistiques publiques, les projets récemment publiés, les partenaires, les établissements et un accès à la connexion. L'espace présente les publications au statut « Publiée » ainsi que les informations non confidentielles relatives aux établissements et aux partenaires ; les informations publiques sont séparées des informations internes ou confidentielles (RG30, RG31) et les projets et partenariats présentés au public sont ceux ayant fait l'objet d'une publication publiée. **BF-EPU-06, 07 à préciser** : traitement des messages du formulaire de contact — destinataire, enregistrement, réponse (F8) ; contenu exact attendu de la vitrine publique (F12).

---

# 4. Règles de gestion

Reprises du cahier des charges version 4 ; le rattachement de chaque règle aux besoins figure en annexe 11.1.

| Code | Règle de gestion | Code | Règle de gestion |
|---|---|---|---|
| RG01 | La Présidence dispose d'un compte unique utilisé par l'équipe Projet et Partenariat. | RG23 | Les conventions signées doivent pouvoir être archivées et téléchargées. |
| RG02 | Chaque établissement dispose d'un compte unique, associé à un seul établissement. | RG24 | Une ancienne version d'un document n'est pas supprimée lors du téléversement d'une nouvelle, et reste téléchargeable. |
| RG03 | Un ou plusieurs comptes Décideur peuvent exister, non rattachés à un établissement. | RG25 | Un document peut être rattaché à un projet ou à une convention et être téléchargé par les utilisateurs autorisés. |
| RG04 | Le visiteur peut accéder aux informations publiques sans compte. | RG26 | L'archivage ne constitue pas une suppression définitive. |
| RG05 | Un établissement ne peut ajouter, consulter et modifier que ses propres informations, depuis son espace de gestion dédié. | RG27 | Chaque établissement et chaque partenaire possède un logo. |
| RG06 | Les informations ajoutées par un établissement sont automatiquement rattachées à celui-ci. | RG28 | Un contact est rattaché à un seul partenaire. |
| RG07 | L'équipe Projet et Partenariat dispose d'une vision globale de toutes les informations enregistrées. | RG29 | Un projet peut être associé à au plus une publication ; une publication peut posséder plusieurs photos. |
| RG08 | Le nom et l'intitulé officiel d'un projet sont deux informations distinctes. | RG30 | Seule une publication au statut « Publiée » est visible par le visiteur. |
| RG09 | Le budget, le type et le statut sont des attributs du projet. | RG31 | Les informations publiques sont séparées des informations internes ou confidentielles. |
| RG10 | Le porteur représente la personne responsable d'un projet. | RG32 | Le Décideur dispose d'un accès en lecture seule aux indicateurs agrégés et au détail des fiches. |
| RG11 | Un projet peut comporter plusieurs activités ; une activité appartient à un seul projet. | RG33 | La gestion administrative des établissements ne fait pas partie du rôle de l'équipe Projet et Partenariat. |
| RG12 | Une activité peut posséder plusieurs entrées de chronogramme (suivi en jours par mois). | RG34 | Une notification est générée lorsqu'un établissement ajoute un nouveau partenaire, un nouveau partenariat ou un nouveau projet. |
| RG13 | L'avancement d'un projet est calculé automatiquement à partir des activités terminées, indépendamment du chronogramme. | RG35 | Une notification peut être générée lors d'une modification importante d'une information suivie par l'équipe. |
| RG14 | Un projet peut être associé à un ou plusieurs sites ; un site peut être associé à plusieurs projets. | RG36 | Notification automatique lorsqu'une convention approche de sa date d'expiration (seuils possibles : 30, 15 ou 7 jours). |
| RG15 | Un projet peut être associé à plusieurs bénéficiaires ; un bénéficiaire peut être associé à plusieurs projets. | RG37 | Notification automatique lorsque la date de fin de validité d'une convention est dépassée. |
| RG16 | Un partenaire est rattaché à un établissement et peut participer à plusieurs partenariats, cotutelles et projets. | RG38 | Une notification peut être générée lorsqu'une activité approche de son échéance. |
| RG17 | Un partenariat peut concerner un ou plusieurs établissements et un ou plusieurs partenaires. | RG39 | Notification automatique lorsqu'une activité dépasse son échéance sans être marquée comme terminée. |
| RG18 | Un partenariat peut comporter plusieurs projets ; un projet n'est rattaché qu'à un seul partenariat au plus, ou à aucun. | RG40 | Notification automatique lorsqu'un projet dépasse sa date de fin prévue sans être terminé. |
| RG19 | Un projet peut posséder ses propres partenaires, en complément ou en l'absence de partenariat. | RG41 | Une notification possède un état indiquant si elle a été lue ou non lue. |
| RG20 | Une cotutelle de thèse est associée à un établissement malgache et à un partenaire (université partenaire). | RG42 | Une notification est associée à l'utilisateur ou au groupe d'utilisateurs concerné. |
| RG21 | Une convention est associée à un partenariat, un projet ou une cotutelle de thèse selon le contexte. | RG43 | Les contrôles relatifs aux conventions, activités et projets sont exécutés périodiquement par le système (par exemple quotidiennement). |
| RG22 | L'étape du circuit de traitement d'une convention est mise à jour manuellement par l'équipe Projet et Partenariat, hors plateforme. | RG44 | La synthèse annuelle par établissement est calculée automatiquement ; seuls les éléments narratifs (domaines, partenaires stratégiques, défis, priorités) sont saisis manuellement. |

Les principes d'ergonomie (relations complexes masquées, regroupement des partenaires et partenariats) relèvent des exigences non fonctionnelles (chapitre 7), conformément au document v4.

---

# 5. Parcours utilisateurs attendus

| Acteur | Parcours |
|---|---|
| **Équipe Projet et Partenariat** | Connexion et tableau de bord global ; gestion complète des partenaires, partenariats, cotutelles, projets, conventions, documents, publications et archives ; suivi des projets (activités, avancement, chronogramme, documents, convention) ; traitement des conventions (étape de circuit, statut, archivage) ; production de la synthèse annuelle par établissement ; exploitation des notifications avec accès direct à l'élément concerné ; recherche et filtrage transverses |
| **Établissement** | Connexion et accès à son espace de gestion minimal, séparé de l'espace public ; consultation de ses listes ; recherche d'un partenaire existant avant création ; création d'un partenariat (établissements et partenaires concernés, intitulé, domaine, dates, statut, champs narratifs) ; création d'un projet rattaché ou autonome ; décomposition en activités et chronogramme ; gestion de la convention et téléversement du document ; création éventuelle d'une publication avec photos ; réception des notifications sur ses données |
| **Décideur** | Connexion et tableau de bord global ; consultation du détail des fiches en lecture seule, sans aucune action de modification ; recherche dans le périmètre global |
| **Visiteur** | Accès direct à la partie publique sans compte (accueil, à propos, établissements, partenaires, projets et partenariats publiés, contact) ; consultation d'une publication : titre, description publique, établissement et logo, partenaires et logos, bénéficiaires, période, résultats, galerie de photos ; accès au formulaire de connexion |

**Enchaînement général** *(synthèse du document v4)* : l'établissement recherche ou ajoute ses partenaires, puis crée un partenariat en sélectionnant les établissements et partenaires concernés. De ce partenariat dépendent un ou plusieurs projets — un projet pouvant exister de façon autonome avec ses propres partenaires. Chaque projet se décompose en activités qui déterminent son avancement, avec un suivi de chronogramme en jours par mois ; les cotutelles sont suivies séparément. Une convention est associée au partenariat, au projet ou à la cotutelle, son étape de circuit étant suivie jusqu'à la signature, puis son statut rendant compte de son cycle de vie. Un projet destiné à la communication publique fait l'objet d'une publication séparée avec photos. La synthèse annuelle est calculée automatiquement par établissement et complétée par quelques éléments narratifs ; les notifications signalent les ajouts des établissements, les échéances proches, les conventions expirées et les retards. L'établissement reste limité à ses données, la Présidence dispose de la vision globale, le Décideur consulte et le visiteur n'accède qu'aux publications rendues publiques.

---

# 6. Écrans attendus

| Écran | Contenu fonctionnel attendu |
|---|---|
| Accueil public | Logo de l'Université, présentation générale, statistiques publiques, projets récemment publiés, partenaires et établissements, accès à la connexion |
| À propos ; Établissements ; Partenaires ; Projets et Partenariats ; Contact | Présentation de l'Université et de son activité de coopération ; liste des établissements (nom, sigle, logo, informations non confidentielles) ; partenaires publics (nom, type, pays, logo, description, site web éventuel) ; publications publiées avec accès au détail ; formulaire de contact ouvert aux visiteurs (traitement à préciser — F8) |
| Connexion | Identifiant, mot de passe, bouton de connexion, lien vers l'espace public |
| Tableaux de bord (Présidence, Établissement, Décideur) | Nombre de partenaires, partenariats, cotutelles, projets par statut, conventions actives, expirées, bientôt expirées — vision globale, limitée à l'établissement, ou globale avec détail en lecture seule selon le rôle |
| Espace établissement | Liste de ses partenaires, partenariats et projets avec statut ; bouton d'ajout ; formulaire de modification |
| Partenaires et partenariats | Recherche ou ajout d'un partenaire (logo, nom, type, pays, contact), puis sélection des établissements et partenaires concernés et saisie du partenariat (intitulé, domaine, dates, statut, champs narratifs) |
| Cotutelles de thèses | Liste et fiche : doctorant, université partenaire, directeurs, dates, financement, état d'avancement |
| Fiche projet | Informations générales, partenariat, partenaires propres, bénéficiaires, porteur, bailleurs, sites, avancement, activités et chronogramme, convention, documents, publication éventuelle |
| Fiche convention | Référence, titre, partenariat / projet / cotutelle lié, dates, étape de circuit, statut, document actuel et historique |
| Synthèse annuelle | Compteurs calculés automatiquement par établissement, complétés par les champs narratifs saisis par l'équipe |
| Archives | Partenaires, partenariats, cotutelles, projets, conventions et documents archivés, avec recherche |
| Publication | Titre, description, établissement et logo, partenaires et logos, bénéficiaires, période, résultats, galerie de photos |
| Notifications et recherche | Liste des notifications avec distinction lu / non lu et accès direct à l'élément concerné ; recherche rapide sur les partenaires, partenariats, cotutelles, projets, conventions et archives, avec filtres |

Aucun écran supplémentaire n'est imposé par la maîtrise d'ouvrage ; les écrans de saisie intermédiaires restent à l'appréciation de la maîtrise d'œuvre.

---

# 7. Exigences non fonctionnelles

## 7.1. Exigences du document v4

**Simplicité d'usage (ENF-01 à 04)** — Les établissements ajoutent leurs projets et partenariats sans connaissances techniques et sans espace d'administration complexe ; les relations complexes entre entités restent invisibles pour l'utilisateur, qui sélectionne simplement les éléments concernés dans une liste ; la gestion des partenaires et des partenariats est regroupée dans une même interface afin de limiter le nombre d'écrans ; les statuts sont présentés de façon lisible.

**Sécurité et confidentialité (ENF-05 à 08)** — Séparation stricte des données entre établissements ; documents et archives accessibles aux seuls utilisateurs autorisés ; authentification pour les espaces internes, espace public accessible sans compte ; application uniforme des droits associés aux rôles.

**Documents et photos (ENF-09, 10)** — Stockage sécurisé des documents et des photos, rattachés à l'élément concerné ; formats de fichiers et limites de taille définis lors de la conception technique, puis validés par la maîtrise d'ouvrage.

**Performance (ENF-11, 12)** — Temps de réponse acceptables lors des opérations courantes, y compris lorsque le volume de données augmente avec le nombre de projets et de partenariats ; listes longues exploitables grâce à la recherche, au filtrage et à l'affichage par pages.

**Évolutivité (ENF-13, 14)** — Conception permettant d'ajouter ultérieurement des fonctionnalités ou des informations sans remise en cause générale ; structure des bailleurs consolidable au fil de l'usage sans reprise complète des données.

**Fiabilité des alertes (ENF-15 à 17)** — Détection fiable et périodique des échéances, couvrant les dates de validité des conventions et les dates prévues des activités et des projets ; limitation de la répétition excessive des notifications relatives à un même événement.

## 7.2. Exigences complémentaires à confirmer

| Réf. | Sujet | Renvoi |
|---|---|---|
| ENF-18 | Journalisation des actions (qui a modifié quoi, quand) pour les données sensibles | F13 |
| ENF-19 | Sauvegarde et conservation des données et des fichiers (durée, fréquence, restauration) | F14 |
| ENF-20 | Accessibilité de l'interface (navigation au clavier, contraste, libellés) | À valider |
| ENF-21 | Navigateurs et matériels pris en charge | À valider |

---

# 8. Recette fonctionnelle attendue

| Scénarios | Contenu et résultats attendus |
|---|---|
| REC-01, REC-02, REC-03 | Création d'un partenaire par un établissement (recherche préalable, caractéristiques, contacts) ; le partenaire apparaît dans les listes de l'établissement et dans la liste globale. Cloisonnement entre deux établissements : chacun ne voit que ses partenaires, partenariats, projets, documents et archives. Création d'un partenariat avec plusieurs établissements et partenaires et les six champs narratifs : le partenariat est enregistré avec ses associations et ses textes |
| REC-04, REC-05 | Projet rattaché à un partenariat : il apparaît dans les projets du partenariat et n'en référence qu'un seul. Projet autonome avec partenaires propres, bénéficiaires, sites, bailleurs et porteur : il existe de façon autonome et affiche ses associations |
| REC-06, REC-07 | Avancement par les activités — trois activités, deux cochées puis une décochée : l'avancement passe à 67 % puis 33 %, le statut du projet reste inchangé. Chronogramme d'une activité avec plusieurs entrées (année, trimestre, mois, jours) : les entrées sont enregistrées et affichées, l'avancement n'est pas modifié |
| REC-08, REC-09 | Dépôt puis remplacement d'un document : la première version est conservée comme archivée et reste téléchargeable. Convention rattachée à un projet avec modification de l'étape de circuit et de sa date : l'étape courante et sa date sont affichées et modifiables |
| REC-10, REC-11 | Expiration d'une convention — échéance proche puis dépassée : alerte à l'approche de l'échéance, puis statut expiré et notification au-delà de la date de fin. Retard d'activité et de projet (échéances passées) : ils sont signalés en retard et génèrent une notification |
| REC-12, REC-13 | Ajout par un établissement (partenaire, partenariat, projet) : la Présidence reçoit les notifications et accède à l'élément depuis la notification. Traitement des notifications : l'élément s'ouvre directement et la notification passe en « lue » |
| REC-14, REC-15 | Publication créée avec photos légendées et ordonnées, puis publiée : elle devient visible publiquement ; en brouillon, elle reste invisible. Espace public sans connexion : seules les publications publiées et les informations publiques sont visibles |
| REC-16, REC-17 | Archivage d'un partenariat inactif puis recherche : l'élément reste consultable, la Présidence voit tout et l'établissement seulement les siens. Tableaux de bord Présidence, Établissement et Décideur : les indicateurs correspondent au périmètre de chaque rôle et aux données enregistrées |
| REC-18, REC-19 | Synthèse annuelle générée avec éléments narratifs et partenaires stratégiques : les compteurs correspondent aux données de l'année, sans ressaisie. Recherche et filtres (projets par statut, période, avancement ; conventions par statut, expiration) : chaque critère réduit la liste et respecte le périmètre du rôle |
| REC-20 | Reprise du suivi Excel : la comparaison avec le fichier `Partenaires_Universites` confirme que les champs narratifs et de suivi correspondent à ceux utilisés aujourd'hui |

**Critère de réception fonctionnelle** : l'ensemble des scénarios ci-dessus est exécuté avec succès et chaque besoin marqué **doit** est vérifié. Les besoins marqués **peut** et les points marqués **à préciser** font l'objet d'une décision explicite de la maîtrise d'ouvrage (chapitre 9) avant réception.

---

# 9. Points à valider avec l'équipe Projet et Partenariat

Le document v4 ne tranche pas les points ci-dessous ; ils doivent être décidés avant la réalisation.

| Réf. | Question | Réf. | Question |
|---|---|---|---|
| F1 | Les activités et le chronogramme (jours par mois et par trimestre) doivent-ils être mis en œuvre, ou la pratique est-elle abandonnée ? | F13 | Faut-il une journalisation des actions (qui a modifié quoi, quand) ? |
| F2 | Le circuit de traitement d'une convention doit-il être suivi dans la plateforme ? Quelles étapes nommées ? | F14 | Quelles exigences de sauvegarde et de conservation des données et des fichiers ? |
| F3 | Les établissements doivent-ils gérer eux-mêmes leurs conventions, documents et publications ? | F15 | Comment un utilisateur renouvelle-t-il son mot de passe en cas d'oubli ? |
| F4 | Un établissement peut-il créer ses propres bailleurs, bénéficiaires, porteurs et sites ? | F16 | Qui alimente et met à jour la liste des établissements ? |
| F5 | Unicité du nom des partenaires : par établissement ou au niveau de l'Université ? | F17 | Quelles valeurs officielles de statut (partenaire, partenariat, projet) et qui les modifie ? |
| F6 | Quelle devise et quel format d'affichage pour le budget des projets ? | F18 | Les listes associées à un projet ou à un partenariat sont-elles modifiables après création ? |
| F7 | Comptes strictement uniques par établissement ? Qui les crée et selon quelle procédure ? | F19 | Critère d'archivage, remise en service, présence des archives dans la recherche générale |
| F8 | Le formulaire de contact public doit-il enregistrer les messages, et à qui sont-ils adressés ? | F20 | Qui dépose et met à jour les logos, sous quels formats ? Fichier du logo officiel à fournir |
| F9 | La synthèse annuelle doit-elle être exportable, et selon quel modèle officiel ? | F21 | L'étape du circuit d'une convention est-elle mise à jour dans la plateforme ou à l'extérieur ? |
| F10 | Quels seuils d'alerte avant expiration (30, 15, 7 jours ou autres) ? À partir de quand une convention est-elle « bientôt expirée » ? | F22 | Quels formats de fichiers et quelles limites de taille accepter pour les documents et les photos ? |
| F11 | Qui doit être destinataire des alertes (Présidence, établissement, Décideur) ? | F23 | Présentation attendue du chronogramme et période de saisie ouverte |
| F12 | Quel contenu exact pour la vitrine publique (coordonnées, montants, statistiques, logo officiel) ? | F24 | Quelles modifications déclenchent une notification, et comment limiter la répétition des alertes ? |

---

# 10. Glossaire

**Activité** : composante d'un projet (intitulé, état terminé ou non, échéance éventuelle), servant au calcul de l'avancement. **Archivage** : retrait de la gestion courante sans suppression définitive, l'élément restant consultable. **Avancement** : pourcentage d'activités terminées rapporté au nombre total d'activités. **Bailleur** : organisme qui finance un projet. **Bénéficiaire** : structure bénéficiant d'un projet. **Chronogramme** : suivi périodique d'une activité en nombre de jours, par année, trimestre et mois. **Circuit de traitement** : étapes internes parcourues par une convention avant sa signature. **Contact** : personne référente rattachée à un partenaire. **Convention** : acte rattaché à un partenariat, un projet ou une cotutelle (référence, dates, statut). **Cotutelle de thèse** : collaboration académique entre un établissement malgache et une université partenaire portant sur la thèse d'un doctorant. **Document** : fichier associé à un projet ou à une convention, avec historique des versions. **Établissement** : structure existante de l'Université participant aux partenariats et portant des projets. **Partenariat** : collaboration entre un ou plusieurs établissements et un ou plusieurs partenaires, pouvant regrouper plusieurs projets. **Partenaire** : organisation externe en relation avec l'Université. **Porteur** : personne responsable d'un projet. **Publication** : contenu destiné à l'espace public pour un projet, distinct des données de gestion. **Site** : lieu où un projet est appliqué ou réalisé. **Synthèse annuelle** : état annuel de l'activité de coopération par établissement. **Visibilité** : caractère public ou privé d'un partenaire, déterminant son affichage public.

---

# 11. Annexes

## 11.1. Rattachement des règles de gestion aux besoins

| Règles | Besoins | Règles | Besoins |
|---|---|---|---|
| RG01 à RG04 | BF-AUT-01 à 04 ; BF-EPU-01 | RG23 à RG27 | BF-CNV-06, 08 ; BF-DOC-03, 04 ; BF-ARC-03 ; BF-ETA-02 ; BF-PAR-03 ; BF-LOG-01, 02 |
| RG05 à RG07 | BF-ACC-01 à 03 ; BF-ESP-01 à 03 ; BF-ARC-02 ; BF-PAR-01 | RG28, RG29 | BF-PAR-06, 07 ; BF-PUB-03, 04 |
| RG08 à RG10 | BF-PRO-01 à 03 ; BF-REF-01 | RG30 à RG33 | BF-PUB-05 ; BF-EPU-03 à 05 ; BF-ACC-04, 05 ; BF-PAR-05 ; BF-TDB-04 ; BF-ETA-01 |
| RG11 à RG13 | BF-ACT-01, 03, 04, 08, 09 ; BF-PRO-10 ; BF-REC-02 | RG34, RG35 | BF-NTF-01, 02 |
| RG14, RG15 | BF-PRO-06, 07 ; BF-REF-03, 04 | RG36 à RG40 | BF-CNV-05 ; BF-NTF-03 à 08 ; BF-ACT-06, 07 ; BF-PRO-09 |
| RG16 à RG22 | BF-PAR-08 ; BF-ETA-03 ; BF-PTR-01, 06, 07 ; BF-PRO-04, 05 ; BF-COT-01 à 04 ; BF-CNV-01, 04 | RG41 à RG44 | BF-NTF-10, 12, 13 ; BF-SYN-01 à 04 ; BF-ACT-10 |

## 11.2. Documents liés

| Document | Rôle |
|---|---|
| `cahier-des-charges-fonctionnel.md` | Version complète : mêmes besoins, chacun détaillé avec sa justification, sa vérification et la traçabilité règle par règle |
| `cahier-des-charges-v5.md` | Analyse technique : description du logiciel, de son état d'implémentation et des écarts constatés |
| `Cahier des de charges.pdf` | Cahier des charges version 4 fourni par la maîtrise d'ouvrage : source du présent document |
| Export PDF | `python3 outils/markdown-vers-pdf.py --chapitres-enchaines --toc-profondeur 1 --toc-sur-place <source.md> <destination.pdf>` |

## 11.3. Historique des versions

Versions 1 à 3 antérieures non fournies ; version 4 du 16 octobre 2026, consolidée à partir des échanges avec l'équipe Projet et Partenariat ; version 5 du 16 octobre 2026, présent document condensé, reprenant intégralement les besoins et les règles de la version 4.

**Note de méthode** : aucun besoin nouveau ; la version complète reste la référence pour le détail.
