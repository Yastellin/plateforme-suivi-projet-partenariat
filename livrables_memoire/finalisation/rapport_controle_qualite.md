# Rapport de contrôle qualité — rapport de stage

## Statut

**Document de travail : non finalisé et non prêt au dépôt.** La version source a été conservée et une copie candidate a été préparée. Les vérifications qui nécessitent les informations de l’auteur, le canevas institutionnel complet ou un rendu Word/PDF restent ouvertes. Le document n’est pas déclaré conforme ni finalisé.

## Source examinée

- Fichier source : `Document rapport de stage.docx`, à la racine de la branche `develop`.
- Commit de la version examinée : `47696f73e47dcb6686c16a7d6626524f2c349b54` (6 novembre 2026).
- Le fichier source original est conservé dans `rapport_stage_original_develop.docx`.
- Copie de travail : `rapport_stage_candidat.docx`.
- Le contenu rédactionnel des chapitres I et II n’a pas été réécrit. Le chapitre II n’a pas reçu de correction de texte.

## Modifications réalisées dans la copie candidate

1. Harmonisation des styles principaux vers Times New Roman, texte courant 12 pt, paragraphes justifiés et interligne 1,5 ; titres noirs avec une hiérarchie typographique ; légendes et textes de tableaux réduits à une taille adaptée. **Le chapitre II est exclu de cette harmonisation : ses paragraphes et leur mise en forme directe ont été restaurés depuis la source, et ses styles source sont isolés dans le DOCX candidat.**
2. Harmonisation des marges des sections du corps du document à 3 cm à gauche, 2 cm à droite et 2,5 cm en haut et en bas. Les deux sections réservées aux couvertures conservent des marges de 2,5 cm. La mise en page effective de la section contenant le chapitre II correspond aux valeurs de la source.
3. Mise en paysage des pages dédiées aux diagrammes des sections Word 4, 6, 8, 10, 12 et 14 (indexées à partir de 1 pour le lecteur), avec réduction proportionnelle des images pour les faire tenir dans la zone disponible. Les proportions ne sont pas étirées.
4. Conservation des 39 images incorporées et des 14 tableaux du document source.
5. Correction, dans l’introduction seulement, de l’attribution du lieu de stage : ITDC MADA est nommé comme entreprise d’accueil et l’équipe Projet et Partenariat de la Présidence comme commanditaire. Le texte du chapitre II demeure intact.
6. Ajout d’un projet de résumé français, d’Abstract anglais et d’une conclusion rédigés à partir des informations présentes dans le rapport. Ces passages restent soumis à la validation de l’auteur.
7. Mise à jour des versions déclarées dans la configuration et des éléments vérifiables sur les exports.
8. Reformulation prudente de la section 8.11 « Notifications » et de la mention de l’incident de convention, sans prétendre que les alertes planifiées ou la correction historique ont été testées.
9. Activation de l’actualisation des champs Word à l’ouverture.

## Résultats des contrôles techniques

- Le DOCX source contient 39 images, 14 tableaux et 15 propriétés de section.
- Le DOCX candidat conserve les 39 images et les 14 tableaux, comporte 15 sections, et son archive DOCX est valide.
- Contrôle comparatif du chapitre II : son texte correspond à la source ; les propriétés directes de paragraphes et de caractères ont été restaurées depuis la source, les styles hérités ont été isolés, et la configuration de page de la section qui le contient correspond à celle de la source. Aucun texte de ce chapitre n’a été édité.
- Les rubriques préliminaires et finales demandées sont désormais alimentées : CV synthétique fondé sur les seules données disponibles, avant-propos, résumé, Abstract, sommaire préliminaire à trois niveaux (70 entrées), listes des figures (24 entrées) et tableaux (13 entrées), liste de 32 abréviations, deux glossaires distincts (15 termes chacun), bibliographie, webographie et annexe de sources techniques.
- Les listes des figures et tableaux comprennent 37 champs `PAGEREF` liés à des signets existants. Le sommaire final conserve son champ `TOC`; l’actualisation automatique à l’ouverture est activée. Les valeurs actualisées n’ont pas été vérifiées dans Word.
- Le document source est en A4 portrait, mais ses sections ont des marges différentes. Le candidat normalise les marges et place les pages de diagrammes dédiées en A4 paysage.
- Le style de corps existant était déjà principalement fondé sur Times New Roman 12 pt, justification et interligne 1,5 ; les titres utilisaient notamment une couleur bleue. La copie candidate harmonise les styles concernés en noir.
- Le sommaire préliminaire à trois niveaux est désormais visible et distinct de la table des matières finale, qui conserve son champ Word `TOC`. Les listes des figures et tableaux sont remplies à partir des légendes existantes et portent des champs `PAGEREF`; leurs numéros de page, références croisées et résultats de champs restent à actualiser et à contrôler dans Word.
- Aucun logiciel Word, LibreOffice, convertisseur DOCX-PDF ou moteur de rendu compatible n’est disponible dans l’environnement. Le PDF final n’a donc pas été généré et le rendu visuel page par page n’a pas été contrôlé.
- Le nombre réel de pages après mise en page n’a pas été vérifié. Les numéros de page conservés dans le sommaire source — qui va jusqu’à la page 88 — ne sont pas une preuve du nombre de pages du candidat.

## Éléments bloquants à résoudre avant dépôt

### Informations personnelles et institutionnelles

- Le CV est rempli sous forme synthétique avec le nom, matricule, formation, parcours, année universitaire, entreprise d’accueil, dates du stage et contribution au backend, tous repris du document. Les coordonnées, expériences antérieures et autres renseignements personnels ne figurent pas dans les sources accessibles ; ils ne sont pas inventés.
- Les noms, fonctions et tâches détaillées de l’équipe technique et des encadreurs doivent être confirmés.
- L’auteur reste responsable de la rédaction finale du chapitre I et de la vérification de ses dates, décrets, missions et chiffres de formation. Aucun de ces faits n’a été inventé ou corrigé ici.
- Le texte du chapitre II est fourni par ITDC MADA et n’a pas été modifié, conformément à la consigne de l’auteur.

### Éléments de stage et résultats

- Le tableau des cinq sprints ne contient pas leurs dates, tâches et livrables réels. Le plan initial mentionne 70 jours, tandis que le stage indiqué du 17 août au 31 octobre 2026 représente 76 jours calendaires en comptant les deux dates.
- La description des pratiques antérieures et de leurs limites reste à étayer par des observations, entretiens ou documents de stage.
- La contribution individuelle détaillée reste à fournir.
- Les résultats des tests, commandes exécutées et preuves associées restent à fournir. La présence de scripts ou de fichiers de test ne prouve pas leur exécution.
- Le signalement de l’incident du formulaire de convention, sa cause historique et le correctif testé nécessitent un compte rendu ou des traces de développement.
- Les alertes périodiques d’expiration apparaissent dans le code, mais l’initialisation du planificateur n’est pas établie dans la configuration inspectée. Leur fonctionnement effectif n’est donc pas confirmé.

### Sources et modélisation

- Les pratiques antérieures, les comparaisons de solutions et plusieurs affirmations institutionnelles nécessitent des sources réellement consultées.
- La bibliographie et la webographie citent désormais le dépôt de code source du projet réellement examiné (commit et date indiqués). Aucune référence externe non consultée n’a été ajoutée ; les affirmations institutionnelles et les pratiques antérieures demandent encore des sources primaires vérifiables.
- Les règles RG doivent être rapprochées de la version validée du cahier des charges. Les numéros provisoires ne doivent pas être présentés comme des numéros officiels.
- Le dictionnaire contient des incertitudes sur le nombre d’entités, les types SQL, les valeurs et certaines relations ; les migrations et le cahier des charges doivent être comparés avant validation.
- Le modèle TypeORM établit une relation facultative Cotutelle–Convention dans le code actuel. Sa conformité au cahier des charges reste à confirmer.

### Images et sommaires

- Les captures disponibles doivent être comparées à leurs légendes et sources ; aucune nouvelle capture n’a été créée.
- La section 8.12 décrit plusieurs profils de tableaux de bord alors que la figure citée illustre un tableau de bord d’établissement. Une capture supplémentaire ou une réduction du texte est nécessaire.
- La figure 8.11 illustre une notification liée à la soumission d’un projet, alors que le titre d’origine portait spécifiquement sur les conventions ; le titre a été élargi dans la copie candidate.
- Les champs du sommaire et les listes de figures/tableaux doivent être actualisés et contrôlés dans Word.

### Pagination et validation visuelle

- La section préliminaire du CV au sommaire est réglée en chiffres romains majuscules à partir de I ; la section contenant l’introduction est réglée en chiffres arabes à partir de 1. Ces réglages OOXML et les champs PAGE des pieds de page n’ont pas été validés par un rendu.
- L’absence de numéro visible sur les pages de présentation des parties et la reprise de la séquence romaine après la conclusion ne sont pas finalisées. Les sauts de section, pieds de page indépendants, numéros masqués et continuité des compteurs doivent encore être contrôlés dans Word après actualisation des champs.
- Le document candidat doit être ouvert dans Microsoft Word ou LibreOffice, converti en PDF, puis contrôlé page par page avant toute affirmation de conformité.
- La règle de 80 à 130 pages ne peut pas être confirmée sans calcul fiable du nombre de pages après rendu.

## Décision de contrôle

La copie candidate constitue une **base de mise en page et de corrections vérifiables**, mais elle ne satisfait pas encore tous les critères de validation finale. En particulier, le PDF, la pagination, l’actualisation et le contrôle des champs, le nombre de pages, les informations personnelles absentes du CV, les sources externes et plusieurs informations de stage restent à traiter. Elle ne doit pas être présentée comme un rapport final prêt au dépôt tant que ces points ne sont pas résolus.