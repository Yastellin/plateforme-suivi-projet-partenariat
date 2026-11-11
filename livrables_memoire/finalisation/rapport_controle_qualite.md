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
10. Suppression des marqueurs provisoires dans les présentations des moyens humains et matériels (tableaux 3.3, 3.4 et 4.1) ; versions des dépendances reportées à partir des lockfiles. Le tableau 9.1 compare désormais les besoins fonctionnels aux fonctions identifiées dans le code, sans présenter les pratiques antérieures comme des observations vérifiées.

## Résultats des contrôles techniques

- Le DOCX source contient 39 images, 14 tableaux et 15 propriétés de section.
- Le DOCX candidat conserve les images et tableaux et son archive DOCX est valide.
- Contrôle comparatif du chapitre II : son texte correspond à la source ; les propriétés directes de paragraphes et de caractères ont été restaurées depuis la source, les styles hérités ont été isolés, et la configuration de page de la section qui le contient correspond à celle de la source. Aucun texte de ce chapitre n’a été édité.
- Le document source est en A4 portrait, mais ses sections ont des marges différentes. Le candidat normalise les marges et place les pages de diagrammes dédiées en A4 paysage.
- Le style de corps existant était déjà principalement fondé sur Times New Roman 12 pt, justification et interligne 1,5 ; les titres utilisaient notamment une couleur bleue. La copie candidate harmonise les styles concernés en noir.
- Le document source comporte un champ de table des matières, mais ses résultats stockés sont à actualiser. Les listes automatiques des figures et tableaux, les références croisées et l’affichage final des champs n’ont pas pu être validés.
- Aucun logiciel Word, LibreOffice, convertisseur DOCX-PDF ou moteur de rendu compatible n’est disponible dans l’environnement. Le PDF final n’a donc pas été généré et le rendu visuel page par page n’a pas été contrôlé.
- Le nombre réel de pages après mise en page n’a pas été vérifié. Les numéros de page conservés dans le sommaire source — qui va jusqu’à la page 88 — ne sont pas une preuve du nombre de pages du candidat.

## Éléments bloquants à résoudre avant dépôt

### Informations personnelles et institutionnelles

- Le CV est vide. Les informations de parcours nécessaires ne figurent pas dans les sources accessibles.
- Les rôles principaux du binôme et du commanditaire sont résumés à partir des informations de stage communiquées et du code. Le nom de l’encadreur professionnel et le détail exhaustif de la répartition individuelle ne sont pas présents dans les éléments du dépôt ; aucun nom ni journal de tâches n’a été fabriqué.
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
- La bibliographie et la webographie ne peuvent pas être complétées sans les références effectivement utilisées et leurs dates de consultation lorsqu’elles sont requises.
- Le chapitre V présente désormais RG01 à RG31 comme une numérotation locale fondée sur le modèle et le code backend, sans la faire passer pour la numérotation officielle RG01 à RG110. La correspondance avec une version validée du cahier des charges reste à établir à partir de ce document de référence.
- Le registre TypeORM compte 33 entités. Les types d’identifiants déclarés dans les entités et ceux des migrations historiques ne sont pas uniformes : plusieurs migrations créent des identifiants en `text` alors que les entités actuelles les déclarent en `uuid`. Les remarques des 104 lignes du dictionnaire ont été complétées à partir des entités, enums, services et migrations correspondant aux champs déjà listés. Les différences TypeORM/migrations sont signalées dans les remarques au lieu d’être masquées ; les colonnes « Type » et la structure exhaustive du dictionnaire restent à valider séparément.
- Le dictionnaire fourni ne reprend pas tous les champs et relations présents dans le code actuel (notamment certaines métadonnées de provenance, les difficultés/perspectives du partenariat et les photos de publication). Ils n’ont pas été ajoutés, car la demande portait sur la colonne « Remarque » des lignes existantes.
- Le modèle TypeORM établit une relation facultative Cotutelle–Convention dans le code actuel. Sa conformité au cahier des charges reste à confirmer.

### Images et sommaires

- Les captures disponibles doivent être comparées à leurs légendes et sources ; aucune nouvelle capture n’a été créée.
- La section 8.12 décrit plusieurs profils de tableaux de bord alors que la figure citée illustre un tableau de bord d’établissement. Une capture supplémentaire ou une réduction du texte est nécessaire.
- La figure 8.11 illustre une notification liée à la soumission d’un projet, alors que le titre d’origine portait spécifiquement sur les conventions ; le titre a été élargi dans la copie candidate.
- Les champs du sommaire et les listes de figures/tableaux doivent être actualisés et contrôlés dans Word.

### Pagination et validation visuelle

- La pagination stricte requise — chiffres romains du CV au sommaire, chiffres arabes à partir de l’introduction, absence de numéro affiché sur les pages de présentation des parties, puis reprise des chiffres romains après la conclusion en continuité avec le sommaire — n’a pas été finalisée ni vérifiée.
- Les sauts de section, pieds de page indépendants, numéros masqués et continuité des compteurs doivent être contrôlés dans Word après actualisation des champs.
- Le document candidat doit être ouvert dans Microsoft Word ou LibreOffice, converti en PDF, puis contrôlé page par page avant toute affirmation de conformité.
- La règle de 80 à 130 pages ne peut pas être confirmée sans calcul fiable du nombre de pages après rendu.

## Décision de contrôle

La copie candidate constitue une **base de mise en page et de corrections vérifiables**, mais elle ne satisfait pas encore tous les critères de validation finale. En particulier, le PDF, la pagination, les champs automatiques, le nombre de pages, le CV, les références et plusieurs informations de stage restent à traiter. Elle ne doit pas être présentée comme un rapport final prêt au dépôt tant que ces points ne sont pas résolus.