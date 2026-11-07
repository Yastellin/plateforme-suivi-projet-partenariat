# Numérotation des pages et gestion des figures

**Rapport de stage Word — procédure pas à pas, macro VBA et document corrigé**

Word 2016 · 2019 · 2021 · Microsoft 365 (Windows) — version du 7 novembre 2026

Document de référence : `dossier stage/rapport_stage_corrige_complet.docx`

> **ℹ️ Information — Résultat obtenu**
>
> Le rapport corrigé `dossier stage/rapport_stage_corrige_pagination.docx` comporte exactement **4 sections** :
>
> - section 1 : page de garde, CV et avant-propos — **aucun numéro** ;
> - section 2 : remerciements à sommaire — **I à XI**, en pied de page centré (11 pages calculées, voir §4.4) ;
> - section 3 : introduction à conclusion — **1 à N**, en pied de page centré ;
> - section 4 : bibliographie à fin du document — **XII et suivants**, en en-tête centré (départ 12 calculé).
>
> Les **12 légendes de figures vides** (Figure 1.1 et Figures 7.3 à 7.13) ont été complétées par un intitulé descriptif, sans modifier les numéros de figures ni les renvois. Les intitulés et les numéros de page des deux listes (figures et tableaux) ont été mis à jour.


> **Sommaire.** Le sommaire détaillé est généré par le champ TOC de ce document : `Ctrl+A` puis `F9`, ou clic droit sur le sommaire > **Mettre à jour les champs**.

# 1. Livrables et décisions

## 1.1 Fichiers livrés

| Fichier | Rôle |
|---|---|
| `dossier stage/rapport_stage_corrige_pagination.docx` | Rapport corrigé : 4 sections, formats, positions, valeurs de départ, en-têtes/pieds déliés, 12 légendes complétées. |
| `dossier stage/GUIDE_numerotation_pages_et_figures_Word.docx` | Le présent guide, prêt à imprimer ou à consulter dans Word. |
| `dossier stage/GUIDE_numerotation_pages_et_figures_Word.md` | Même guide au format texte, pour lecture rapide et copier-coller. |
| `dossier stage/macros_numerotation_rapport.bas` | Module VBA complet et commenté, à importer dans l'éditeur Word. |

Le fichier source `rapport_stage_corrige_complet.docx` n'a **pas** été modifié. Toutes les opérations ont été faites sur une copie.

## 1.2 Décisions retenues

| Point | Décision |
|---|---|
| Nombre de sections | **4 sections**, de la page de garde à la fin du document. |
| Section 1 | Couverture jusqu'à l'avant-propos inclus : aucun numéro. |
| Section 2 | Remerciements jusqu'au sommaire : **romain majuscule** (I, II, III…), départ à **1**. |
| Section 3 | Introduction jusqu'à la conclusion : **arabe** (1, 2, 3…), départ à **1**. |
| Section 4 | Bibliographie jusqu'à la fin : **romain majuscule**, départ calculé pour reprendre la suite de la section 2. |
| Position section 2 | **Pied de page, centré.** |
| Position section 3 | **Pied de page, centré.** |
| Position section 4 | **En-tête, centré.** |
| Légendes vides | **Complétées** par un intitulé, sans suppression ni déplacement. |

> **⚠️ Attention — Romain majuscule, pas minuscule**
>
> Le cahier des charges initial parlait de « i, ii, iii ». La décision retenue est le **romain majuscule** (I, II, III), conformément à votre réponse. Si le canevas de l'école impose le minuscule, remplacez `wdPageNumberStyleUppercaseRoman` par `wdPageNumberStyleLowercaseRoman` dans la macro, et choisissez `i, ii, iii, ...` dans la boîte **Format des numéros de page**. Les valeurs de départ ne changent pas.


## 1.3 Portée et limites

- La procédure couvre Word 2016, 2019, 2021 et Microsoft 365 sous Windows. Les libellés français sont donnés ; l'annexe B donne la correspondance anglaise.
- Aucun Word, LibreOffice ou moteur de rendu n'était disponible dans l'environnement de production. Le fichier corrigé a été contrôlé au niveau de sa structure OOXML (4 sections, formats, valeurs de départ, références d'en-têtes/pieds, 12 légendes), mais **le rendu page à page doit être vérifié dans Word** avant dépôt.
- La valeur de départ de la bibliographie (XII) repose sur le nombre de pages de la section 2 constaté dans le document source : 11 pages. Si vous modifiez le contenu de cette section, relancez la macro **RecalerRepriseRomaine** ou ajustez la valeur de départ.
- La macro ne rédige pas les titres des figures à votre place : elle détecte, complète, masque ou supprime. Les intitulés du rapport ont été rédigés à partir du contenu visible des captures.

# 2. Audit du rapport fourni

## 2.1 Structure constatée

Le fichier `rapport_stage_corrige_complet.docx` contient **9 sections Word** et **aucun en-tête**. Les numéros sont tous dans des pieds de page, avec de nombreux pieds vides.

| Section Word | Contenu | Pied de page constaté | Remarque |
|---|---|---|---|
| 1 | Page de garde | Aucun | Correct pour la couverture. |
| 2 | CV, avant-propos, remerciements, résumé, abstract, listes, glossaire, sommaire, introduction | Pied vide | Aucun numéro visible sur tout le bloc. |
| 3 | Page « PARTIE I » | Champ `PAGE` centré | Numéro en bas. |
| 4 | Chapitres I à III | Champ `PAGE` centré | Numéro en bas. |
| 5 | Page « PARTIE II » | Champ `PAGE` centré | Numéro en bas. |
| 6 | Chapitres IV à VI | Champ `PAGE` centré | Numéro en bas. |
| 7 | Page « PARTIE III » | Champ `PAGE` centré | Numéro en bas. |
| 8 | Chapitres VII à IX et conclusion | Champ `PAGE` centré | Numéro en bas. |
| 9 | Bibliographie, webographie, glossaire, annexes, table des matières | Champ `PAGE` avec `upperRoman` et départ **14** | Numéro en bas, romain majuscule. |

Les valeurs enregistrées dans les champs (`42`, `72`, `101`, `XXI`) correspondent à l'ancienne pagination et confirment que le document n'a pas été repaginé après ses dernières modifications.

## 2.2 Pagination actuelle, en pratique

- La page de garde n'a pas de numéro : c'est déjà acquis.
- Les pages 3 à 15 (CV, avant-propos, remerciements, sommaire) **n'ont aucun numéro**.
- L'introduction se trouve dans la même section que le CV et le sommaire.
- Le corps ne redémarre pas à 1 : il continue la numérotation physique.
- La bibliographie démarre à **XIV** (14), alors que le dernier page liminaire numérotée serait **XI** si l'on ne comptait que les remerciements au sommaire. Il y a donc un décalage de deux pages, hérité de l'ancienne structure.
- Les pages « PARTIE I », « PARTIE II » et « PARTIE III » sont numérotées comme le corps.

## 2.3 Légendes et listes de figures

- Le document contient **43 images** (41 images en ligne selon le décompte `python-docx`, plus les objets ancrés) et **16 tableaux**.
- Les légendes sont du **texte statique** : `Figure 1.1 :`, `Figure 2.1 : Méthode de travail`, etc.
- **Aucun champ `SEQ Figure`** n'est présent : Word ne peut donc ni renuméroter automatiquement les figures, ni construire une table des illustrations automatique.
- **Aucun champ `REF`** vers une figure : les mentions « figure 7.1 » dans le texte sont saisies à la main. Il n'y a donc pas de renvoi automatique à casser.
- La « LISTE DES FIGURES » est une **liste manuelle** : chaque ligne est un texte suivi d'une tabulation et d'un numéro de page. Elle n'est pas reliée aux légendes.
- **12 légendes sont vides** : Figure 1.1, puis Figures 7.3 à 7.13. La liste manuelle reprend ces vides.

## 2.4 Ce qui doit changer

1. Ramener 9 sections à **4 sections** sans modifier le contenu.
2. Donner à la section 2 le format **romain majuscule** et le départ **1**.
3. Donner à la section 3 le format **arabe** et le départ **1**.
4. Donner à la section 4 le format **romain majuscule** et le départ **N + 1**, où N est le nombre de pages de la section 2.
5. Supprimer tout numéro de la section 1.
6. Placer les numéros en pied centré pour les sections 2 et 3, en en-tête centré pour la section 4.
7. Compléter les 12 légendes vides sans toucher aux numéros.
8. Mettre à jour la liste manuelle des figures et les champs.

# 3. Schéma cible de pagination

## 3.1 Les quatre sections

| Section | Début | Fin | Format | Départ | Position | En-tête/pied |
|---|---|---|---|---|---|---|
| 1 | Page de garde | Avant-propos inclus | Aucun | — | — | Aucun champ `PAGE`. |
| 2 | Remerciements | Sommaire inclus | `I, II, III…` | 1 | Pied centré | Champ `PAGE` seul. |
| 3 | Introduction | Conclusion incluse | `1, 2, 3…` | 1 | Pied centré | Champ `PAGE` seul. |
| 4 | Bibliographie | Fin du document | `I, II, III…` | N + 1 | En-tête centré | Champ `PAGE` en haut, pied vide. |

Dans le rapport corrigé, N = 11, donc la section 4 démarre à **XII**.

## 3.2 Trois compteurs indépendants

Word ne possède pas un compteur unique « à plat ». Chaque section peut :

- **continuer** le compteur de la section précédente ;
- **redémarrer** à une valeur choisie.

Le tableau ci-dessous montre l'effet des réglages retenus.

| Section | Ce que fait Word | Ce que voit le lecteur |
|---|---|---|
| 1 | Compteur physique 1, 2, 3, 4, mais aucun champ affiché | Rien. |
| 2 | Redémarre à 1, format romain majuscule | I, II, III… XI. |
| 3 | Redémarre à 1, format arabe | 1, 2, 3… N. |
| 4 | Redémarre à N + 1, format romain majuscule | XII, XIII… |

## 3.3 Conséquences du choix « 4 sections »

- **Le CV et l'avant-propos ne sont pas numérotés**, puisqu'ils sont dans la section 1 avec la page de garde. Si le canevas exige un numéro sur l'avant-propos, il faut soit le déplacer dans la section 2, soit créer une cinquième section — ce qui contredit la structure demandée.
- **Les pages de présentation des parties sont numérotées** comme le corps (section 3), puisqu'elles ne peuvent plus être des sections séparées. C'est la conséquence directe de la règle « 4 sections ».
- **Les annexes, le glossaire et la table des matières sont numérotés en romain**, puisqu'ils sont dans la section 4 avec la bibliographie.
- **La page de garde, le CV et l'avant-propos** peuvent tout de même apparaître dans la table des matières avec des numéros arabes (3, 4), car le champ `PAGEREF` lit le compteur physique de la section 1. C'est normal : l'absence de numéro affiché n'empêche pas la référence interne.

> **📌 Remarque — Pourquoi la section 4 ne peut pas « continuer »**
>
> Si la section 3 redémarre à 1, le compteur romain de la section 2 est écrasé. La section 4 ne peut donc pas retrouver spontanément la suite de I…XI. Il faut lui donner une valeur de départ calculée : N + 1. C'est l'objet du chapitre 4.


# 4. Reprise exacte de la séquence romaine

## 4.1 Pourquoi « Continuer depuis la section précédente » ne suffit pas

Imaginons la configuration suivante :

- section 2 : I, II, III (3 pages) ;
- section 3 : 1, 2, 3, 4 (4 pages) ;
- section 4 : si l'on choisit « Continuer depuis la section précédente », Word reprend le compteur arabe à 5 et l'affiche en romain : **V**. Ce n'est pas la suite de la section 2 (qui serait IV).

Autrement dit, « continuer » ne conserve pas une séquence romaine parallèle : il continue le **dernier compteur utilisé**, celui de la section 3. Pour reprendre la suite de la section 2, il faut :

1. compter les pages de la section 2 ;
2. ajouter 1 ;
3. saisir cette valeur dans **Commencer à**.

C'est une valeur **manuelle**, donc à recalculer après toute modification du nombre de pages de la section 2.

## 4.2 Méthode de calcul

### Méthode A — Lire le dernier numéro romain

1. Placez le curseur sur la **dernière page de la section 2** (la dernière page du sommaire).
2. Lisez le numéro affiché en pied de page : par exemple **XI**.
3. Convertissez-le en arabe : XI = 11.
4. La section 4 doit démarrer à 11 + 1 = **12**, soit **XII**.

### Méthode B — Compter les pages

1. Placez le curseur sur la première page de la section 2.
2. Notez le numéro de page physique affiché dans la barre d'état (par exemple « Page 5 sur 113 »).
3. Placez le curseur sur la dernière page de la section 2 (par exemple « Page 15 sur 113 »).
4. Nombre de pages = 15 − 5 + 1 = **11**.
5. Départ de la section 4 = 11 + 1 = **12**.

> **⚠️ Attention — Ne confondez pas**
>
> La barre d'état affiche la **page physique** (5, 15), pas le numéro romain affiché (I, XI). Utilisez la barre d'état pour compter, et le pied de page pour vérifier le format.


### Méthode C — Macro

La macro `RecalerRepriseRomaine` fait le calcul elle-même :

- elle mesure le nombre de pages de la section 2 ;
- elle écrit `N + 1` dans la valeur de départ de la section 4 ;
- elle met à jour les champs et affiche le résultat.

C'est la méthode à privilégier après la mise en page finale.

## 4.3 Table de correspondance

| Arabe | Romain | Arabe | Romain | Arabe | Romain |
|---:|---|---:|---|---:|---|
| 1 | I | 9 | IX | 17 | XVII |
| 2 | II | 10 | X | 18 | XVIII |
| 3 | III | 11 | XI | 19 | XIX |
| 4 | IV | 12 | XII | 20 | XX |
| 5 | V | 13 | XIII | 21 | XXI |
| 6 | VI | 14 | XIV | 22 | XXII |
| 7 | VII | 15 | XV | 23 | XXIII |
| 8 | VIII | 16 | XVI | 24 | XXIV |

## 4.4 Application au rapport

D'après la table des matières d'origine :

- remerciements : page physique 5 ;
- introduction : page physique 16 ;
- donc la section 2 (remerciements → sommaire) occupe les pages 5 à 15, soit **11 pages** ;
- la section 4 doit démarrer à **12**, soit **XII**.

C'est la valeur inscrite dans le document corrigé : `w:pgNumType w:fmt="upperRoman" w:start="12"`.

> **⚠️ Attention — Si le nombre de pages change**
>
> Toute modification du sommaire, des remerciements, du résumé, de l'abstract, des listes ou du glossaire peut ajouter ou retirer une page à la section 2. Dans ce cas, la valeur 12 n'est plus bonne : relancez `RecalerRepriseRomaine` ou refaites le calcul. La section 4 ne se recale pas toute seule.


# 5. Procédure manuelle pas à pas dans Word

Cette procédure décrit à la fois :

- le **contrôle** du document corrigé fourni ;
- la **reconstruction** de la pagination sur un autre document.

Les libellés correspondent à Word en français. L'annexe B donne les équivalents anglais.

## 5.1 Avant de commencer

1. **Faites une copie** du rapport : `Fichier > Enregistrer sous`, avec un nom explicite (`rapport_stage_pagination_v1.docx`). Ne travaillez jamais sur l'original.
2. Ouvrez le document dans **Word** (pas dans un aperçu ni dans un éditeur DOCX).
3. Activez l'affichage des marques : onglet **Accueil**, groupe **Paragraphe**, bouton **¶** (ou `Ctrl+Maj+8`). Vous devez voir les marques de paragraphe, les tabulations et les sauts.
4. Affichez les codes de champ : `Alt+F9`. Les champs apparaissent entre accolades, par exemple `{ PAGE }`. Refaites `Alt+F9` pour revenir à l'affichage normal.
5. Ouvrez le **volet de navigation** si besoin : onglet **Affichage**, case **Volet de navigation**. Il aide à repérer les titres.
6. Vérifiez que le document est en mode **Page** : onglet **Affichage**, groupe **Affichages**, bouton **Page**.
7. Enregistrez avant chaque étape importante.

> **ℹ️ Information — Ce que vous devez voir**
>
> - Un saut de section s'affiche comme une **double ligne pointillée** portant la mention « Saut de section (Page suivante) ».
> - Un saut de page s'affiche comme une **simple ligne pointillée**.
> - Ne confondez pas les deux : c'est l'erreur la plus fréquente de ce dossier.


## 5.2 Étape 1 — Vérifier ou créer les quatre sections

### Principe

Une section Word se termine par un **saut de section**. Le contenu qui suit le saut appartient à la section suivante. Pour obtenir 4 sections, il faut donc **3 sauts de section** dans le document, placés :

1. après le dernier paragraphe de l'avant-propos, juste avant le titre **REMERCIEMENTS** ;
2. après le sommaire, juste avant le titre **INTRODUCTION** ;
3. après la conclusion, juste avant le titre **BIBLIOGRAPHIE**.

Le rapport source possède **déjà** le saut n° 3 (la section 8 se termine par la conclusion, la section 9 commence par la bibliographie). Il faut donc en **insérer deux nouveaux** (n° 1 et n° 2) et **conserver** le n° 3. Le document se termine par la section 4, sans saut supplémentaire.

### Geste Word

1. Placez le curseur **à la fin du dernier paragraphe** de la section à clôturer.
2. Onglet **Mise en page**.
3. Groupe **Mise en page**, bouton **Sauts**.
4. Choisissez **Sauts de section**, puis **Page suivante**.

Insérez les sauts aux emplacements 1 et 2. Vérifiez que le saut 3 est déjà présent avant **BIBLIOGRAPHIE**. Contrôlez ensuite le nombre de sections : la barre d'état affiche **Section : X** (activez-la par clic droit sur la barre d'état si nécessaire) ; vous devez voir exactement **4 sections** après l'étape 5.3.

### Emplacements exacts dans ce rapport

| Section à clôturer | Dernier paragraphe | Titre suivant |
|---|---|---|
| 1 | Dernier paragraphe de l'avant-propos, se terminant par « … sources consultées. » | `REMERCIEMENTS` |
| 2 | Dernière entrée du sommaire | `INTRODUCTION` |
| 3 | Dernier paragraphe de la conclusion, se terminant par « … évaluation de l'usage de la plateforme. » | `BIBLIOGRAPHIE` — **saut déjà présent**, à conserver |

> **⚠️ Attention — Un saut de section « Page suivante » remplace un saut de page**
>
> Si un saut de page existe déjà à l'endroit choisi, **supprimez-le d'abord** : sinon Word ajoutera une page blanche. Placez le curseur juste avant le saut de page, appuyez sur `Suppr`, puis insérez le saut de section.


## 5.3 Étape 2 — Supprimer les sections en trop

Le document source contient 9 sections. Il faut en supprimer 7, tout en conservant la pagination.

### Repérer les sauts

1. Activez **¶**.
2. Parcourez le document : chaque saut de section est une double ligne pointillée avec « Saut de section (Page suivante) ».
3. Notez les 7 sauts à supprimer :
   - après la page de garde ;
   - après l'introduction ;
   - après la page « PARTIE I » ;
   - après le chapitre III ;
   - après la page « PARTIE II » ;
   - après le chapitre VI ;
   - après la page « PARTIE III ».

### Supprimer sans casser la mise en page

1. Placez le curseur **juste avant** la double ligne du saut de section.
2. Appuyez sur `Suppr`.
3. Le saut disparaît et le contenu suivant remonte. Pour éviter que deux blocs se retrouvent sur la même page :
   - annulez (`Ctrl+Z`) ;
   - placez le curseur à la fin du dernier paragraphe de la section précédente ;
   - insérez un **saut de page** avec `Ctrl+Entrée` ;
   - supprimez ensuite le saut de section.

Répétez pour les 7 sauts. À la fin, il ne doit rester que :

- le saut après l'avant-propos ;
- le saut avant l'introduction ;
- le saut après la conclusion ;
- la fin du document (section 4).

> **⚠️ Attention — Ne supprimez pas le saut après la conclusion**
>
> C'est lui qui sépare la section 3 (introduction → conclusion) de la section 4 (bibliographie → fin). Sans lui, la bibliographie serait numérotée en arabe avec le corps.


> **✅ Résultat — Méthode plus sûre**
>
> Partez du fichier `rapport_stage_corrige_pagination.docx` : les 4 sections sont déjà en place, les 7 sauts superflus ont été remplacés par des sauts de page, et le contenu n'a pas été modifié. Vous pouvez passer directement à l'étape 4.


## 5.4 Étape 3 — Délier les en-têtes et pieds de page

Par défaut, un en-tête ou un pied de page est **lié au précédent** : il affiche le même contenu que la section précédente. Il faut délier chaque section pour lui donner son propre numéro.

### Geste Word

1. Double-cliquez dans le **pied de page** de la section 2 (remerciements). Word ouvre l'onglet contextuel **En-tête et pied de page**.
2. Dans le groupe **Navigation**, cliquez sur **Lier au précédent** pour **désactiver** le bouton. Quand il est actif, il apparaît enfoncé ; quand il est désactivé, il ne l'est plus et la mention « Identique au précédent » disparaît.
3. Faites de même pour l'**en-tête** de la section 2.
4. Répétez pour les sections 3 et 4 : en-tête **et** pied de page.

### Cas particuliers

- Si **Première page différente** est cochée, Word gère un en-tête/pied de première page séparé : déliez-le aussi, ou décochez l'option.
- Si **Pages paires et impaires différentes** est cochée, déliez les versions paires et impaires.
- Dans le document corrigé, ces deux options sont désactivées : un seul en-tête et un seul pied par section.

> **⚠️ Attention — L'ordre compte**
>
> Déliez **avant** de taper ou de supprimer quoi que ce soit. Si vous modifiez un en-tête encore lié, vous modifiez toutes les sections qui partagent le même en-tête.


## 5.5 Étape 4 — Placer le champ PAGE

Un numéro de page correct est un **champ**, pas un texte tapé. Le champ s'actualise automatiquement quand la pagination change.

### Section 2 et section 3 : pied de page centré

1. Cliquez dans le corps de la section 2 (par exemple sur le titre REMERCIEMENTS).
2. Onglet **Insertion**.
3. Groupe **En-tête et pied de page**, bouton **Numéro de page**.
4. Choisissez **Bas de page**, puis **Centré**.

Word insère un champ `{ PAGE }` centré dans le pied de page de la section. Répétez pour la section 3.

### Section 4 : en-tête centré

1. Cliquez dans le corps de la section 4 (par exemple sur le titre BIBLIOGRAPHIE).
2. **Insertion > Numéro de page > Haut de page > Centré**.
3. Vérifiez que le **pied de page** de la section 4 est vide : s'il contient encore un champ `PAGE` hérité, déliez-le et supprimez-le.

### Section 1 : aucun champ

La section 1 ne doit contenir **aucun** champ `PAGE`, ni en en-tête, ni en pied. Dans le document corrigé, elle n'a même aucune référence d'en-tête/pied : Word n'affiche donc rien.

### Vérification du champ

1. `Alt+F9` pour afficher les codes.
2. Vous devez voir `{ PAGE }` et non `1` ou `I`.
3. `Alt+F9` pour revenir à l'affichage normal.

> **ℹ️ Information — Pourquoi un champ ?**
>
> Un numéro tapé « 1 » ne changera jamais. Un champ `{ PAGE }` suit la pagination, les ajouts de pages, les suppressions et les exports PDF. C'est la seule méthode fiable.


## 5.6 Étape 5 — Régler le format et la valeur de départ

Cette étape est la clé de tout le dossier. Le réglage s'applique à la **section où se trouve le curseur**.

### Ouvrir la boîte

1. Cliquez dans le **corps** de la section à régler (pas dans l'en-tête, pour éviter toute ambiguïté).
2. Onglet **Insertion**.
3. Bouton **Numéro de page**.
4. **Format des numéros de page…**

La boîte **Format des numéros de page** s'ouvre.

### Section 1

- **Format de numérotation** : peu importe, aucun champ n'est affiché.
- **Numérotation des pages** : ne cochez pas « Commencer à ».
- Laissez la section continuer ou redémarrer, cela n'a aucun effet visible.

### Section 2

1. **Format de numérotation** : `I, II, III, ...`.
2. **Numérotation des pages** : cochez **Commencer à** et saisissez **1**.
3. Cliquez sur **OK**.

Résultat attendu : I, II, III… XI en pied de page centré.

### Section 3

1. **Format de numérotation** : `1, 2, 3, ...`.
2. **Numérotation des pages** : cochez **Commencer à** et saisissez **1**.
3. **OK**.

Résultat attendu : 1, 2, 3… N en pied de page centré.

### Section 4

1. **Format de numérotation** : `I, II, III, ...`.
2. **Numérotation des pages** : cochez **Commencer à** et saisissez **12** (ou N + 1, voir chapitre 4).
3. **OK**.

Résultat attendu : XII, XIII… en en-tête centré.

> **⚠️ Attention — Ne cochez « Continuer depuis la section précédente » que pour la section 1**
>
> Pour les sections 2, 3 et 4, choisissez toujours **Commencer à** avec la valeur calculée. « Continuer » donnerait :
>
> - section 2 : la suite de la section 1 (2, 3…) au lieu de I ;
> - section 3 : la suite de la section 2 en arabe (12, 13…) au lieu de 1 ;
> - section 4 : la suite de la section 3 en romain (LXXXVII…) au lieu de XII.


## 5.7 Étape 6 — Supprimer tout numéro sur la page de garde

Dans le document corrigé, la section 1 n'a aucun champ : il n'y a rien à supprimer. Si vous voyez malgré tout un numéro sur la page de garde, voici les causes et les remèdes.

### Cause 1 — Le pied de page est lié au précédent

1. Double-cliquez sur le numéro de la page de garde.
2. Onglet **En-tête et pied de page**.
3. **Lier au précédent** : désactivez.
4. Sélectionnez le numéro et supprimez-le (`Suppr`).
5. Faites de même dans l'en-tête.

### Cause 2 — « Première page différente » est mal réglée

1. Onglet **En-tête et pied de page**.
2. Groupe **Options**.
3. Si **Première page différente** est cochée, deux possibilités :
   - décochez-la si vous voulez le même en-tête/pied partout dans la section ;
   - gardez-la et videz l'en-tête/pied de première page.
4. Vérifiez aussi **Pages paires et impaires différentes**.

### Cause 3 — Un numéro a été tapé à la main

1. `Alt+F9` pour afficher les codes.
2. Si vous voyez `1` au lieu de `{ PAGE }`, sélectionnez-le et supprimez-le.
3. `Alt+F9` pour revenir.

### Ce qu'il ne faut pas faire

N'utilisez pas **Insertion > Numéro de page > Supprimer les numéros de page** pour corriger seulement la page de garde : cette commande agit sur le document entier et supprime les numéros de toutes les sections. Préférez toujours le déliaison + suppression locale.

> **✅ Résultat — Vérification**
>
> La page de garde, le CV et l'avant-propos ne doivent afficher **aucun** numéro. La première page numérotée doit être la première page des remerciements, avec **I**.


## 5.8 Étape 7 — Contrôler les transitions

Parcourez le document et vérifiez les quatre transitions suivantes.

| Transition | Dernière page de la section | Première page de la section suivante | Attendu |
|---|---|---|---|
| 1 → 2 | Avant-propos | Remerciements | Aucun numéro → **I** |
| 2 → 3 | Sommaire | Introduction | **XI** → **1** |
| 3 → 4 | Conclusion | Bibliographie | **N** → **XII** |

Si l'une des valeurs ne correspond pas :

- vérifiez le **format** et la **valeur de départ** de la section concernée ;
- vérifiez que l'en-tête/pied n'est pas lié au précédent ;
- vérifiez qu'aucun champ `PAGE` ne subsiste dans l'autre zone (en-tête ou pied) ;
- mettez à jour les champs (`Ctrl+A`, `F9`).

## 5.9 Étape 8 — Vérifier la structure finale

1. Onglet **Mise en page** : Word indique le nombre de sections dans la boîte de dialogue **Mise en page** (onglet **Disposition** ou **Mise en page** selon la version).
2. `Ctrl+Fin` : vous devez être dans la section 4.
3. `Alt+F9` : vous devez voir les champs `{ PAGE }` aux bons endroits.
4. Enregistrez.

> **ℹ️ Information — Le document corrigé**
>
> Le fichier `rapport_stage_corrige_pagination.docx` contient déjà :
>
> - 4 sections ;
> - section 1 sans en-tête/pied ;
> - section 2 : `upperRoman`, départ 1, pied centré ;
> - section 3 : `decimal`, départ 1, pied centré ;
> - section 4 : `upperRoman`, départ 12, en-tête centré, pied vide.


# 6. Légendes de figures et légendes vides

## 6.1 Comment Word numérote les figures

Word ne numérote automatiquement une figure que si la légende contient un **champ `SEQ`**. Une légende insérée avec **Références > Insérer une légende** ressemble à ceci en codes de champ :

`Figure { SEQ Figure \* ARABIC } : Titre de la figure`

Le champ `SEQ Figure` tient un compteur. Chaque nouvelle légende l'incrémente. Les fonctions qui en dépendent sont :

- la **renumérotation** automatique après insertion ou suppression d'une légende ;
- la **table des illustrations** (ou table des figures), qui collecte les paragraphes contenant `SEQ Figure` ;
- les **renvois** vers le numéro de la figure, qui pointent vers un signet créé par Word autour de la légende.

Sans champ `SEQ`, Word ne peut rien renuméroter ni collecter : tout est du texte.

## 6.2 Constat sur le rapport fourni

| Élément | État constaté | Conséquence |
|---|---|---|
| Champs `SEQ Figure` | **0** | Aucune renumérotation automatique possible. |
| Légendes | Texte statique `Figure X.Y : …` | Les numéros sont figés. |
| Légendes vides | **12** | La table des figures et la liste sont incomplètes. |
| Liste des figures | Manuelle, avec tabulation et numéro de page | Non reliée aux légendes ; à mettre à jour à la main. |
| Champs `REF` vers les figures | **0** | Aucun renvoi automatique à casser. |
| Table des illustrations automatique | **Absente** | La « LISTE DES FIGURES » est un texte. |

> **⚠️ Attention — Point capital**
>
> Dans ce rapport, **il n'y a pas de table des figures automatique** et **pas de renvois automatiques**. Les expressions « table des figures » et « renvois » du cahier des charges désignent donc :
>
> - la liste manuelle « LISTE DES FIGURES » ;
> - les mentions de figures saisies dans le texte (« la figure 7.1… »).
>
> Compléter les légendes ne peut pas casser des mécanismes qui n'existent pas encore. En revanche, si vous convertissez plus tard les légendes en champs `SEQ`, les règles du chapitre 6.5 s'appliquent.


## 6.3 Identifier toutes les légendes vides

### Méthode 1 — Inspection visuelle

1. Activez **¶**.
2. Parcourez le document en mode Page.
3. Une légende vide ressemble à `Figure 7.3 :` seule, sans texte après les deux-points.
4. Utilisez le volet de navigation pour aller de titre en titre.

### Méthode 2 — Recherche avec caractères génériques

1. `Ctrl+H` (onglet **Accueil > Remplacer**).
2. Cliquez sur **Plus >>**.
3. Cochez **Utiliser les caractères génériques**.
4. Dans **Rechercher**, saisissez :

`Figure [0-9]@.[0-9]@[ ]@:`

5. Cliquez sur **Suivant** pour parcourir les occurrences.

Cette recherche trouve les légendes qui commencent par « Figure », un ou plusieurs chiffres, un point, un ou plusieurs chiffres, des espaces et un deux-points. Elle trouve aussi les légendes complètes : vérifiez visuellement qu'il n'y a rien après le deux-points.

> **📌 Remarque — Syntaxe des caractères génériques Word**
>
> `[0-9]@` signifie « un ou plusieurs chiffres » ; `.` est un point littéral ; `[ ]@` signifie « un ou plusieurs espaces ». Word n'utilise pas la syntaxe des expressions régulières (`\d`, `+`, `*` ont d'autres sens).


### Méthode 3 — Recherche des champs `SEQ`

1. `Alt+F9` pour afficher les codes de champ.
2. `Ctrl+F`, recherchez `SEQ Figure`.
3. `Ctrl+F` suivant pour parcourir toutes les légendes qui possèdent un champ.

Cela permet de distinguer les légendes **automatiques** (avec `SEQ`) des légendes **statiques** (sans champ).

### Méthode 4 — Macro de diagnostic

La macro `DiagnostiquerLegendesVides` :

- parcourt tous les paragraphes ;
- reconnaît les légendes de figures par leur style ou par le préfixe « Figure » ;
- ignore les entrées de la liste manuelle (qui contiennent une tabulation) ;
- teste si le texte ne contient qu'un numéro et un séparateur ;
- affiche la page, le style, le texte exact et la présence d'un champ `SEQ` ;
- produit un rapport dans un nouveau document.

C'est la méthode la plus fiable, et celle qui a servi à établir le tableau ci-dessous.

## 6.4 Les douze légendes vides du rapport

| N° | Page indicative | Emplacement | Texte constaté | Intitulé ajouté |
|---|---:|---|---|---|
| 1.1 | 26 | 1.4 Organigramme de l'EMIT | `Figure 1.1 :` | Organigramme de l’EMIT |
| 7.3 | 77 | 7.4 Configuration de l'environnement | `Figure 7.3 :` | Fichier docker-compose.yml |
| 7.4 | 78 | 7.5.1 Authentification JWT | `Figure 7.4 :` | Authentification JWT — login |
| 7.5 | 79 | 7.5.2 Création et soumission | `Figure 7.5 :` | Contrôleur des projets — création |
| 7.6 | 80 | 7.5.2 Création et soumission | `Figure 7.6 :` | Service des projets — création |
| 7.7 | 81 | 7.5.2 Création et soumission | `Figure 7.7 :` | Service des projets — soumission |
| 7.8 | 82 | 7.5.3 Publication d'un projet | `Figure 7.8 :` | Contrôleur des projets — publication |
| 7.9 | 82 | 7.5.3 Publication d'un projet | `Figure 7.9 :` | Service des projets — publication |
| 7.10 | 83 | 7.5.4 Gestion des conventions | `Figure 7.10 :` | Service des conventions — création |
| 7.11 | 84 | 7.5.4 Gestion des conventions | `Figure 7.11 :` | Service des conventions — mise à jour |
| 7.12 | 85 | 7.5.5 Notifications | `Figure 7.12 :` | Notifications d’expiration des conventions |
| 7.13 | 86 | 7.5.6 Tableaux de bord | `Figure 7.13 :` | Service des tableaux de bord |

Les intitulés ont été déduits du contenu visible des captures : fichier `docker-compose.yml`, méthode `login`, contrôleur et service des projets, service des conventions, règle d'expiration, service des tableaux de bord.

## 6.5 Les quatre options possibles

| Option | Geste | Numérotation des figures | Table des figures | Renvois | Recommandation |
|---|---|---|---|---|---|
| 1. Supprimer | Supprimer le paragraphe de légende. | Si `SEQ` : les suivantes reculent de 1. Si statique : trou dans la suite. | L'entrée disparaît. | Risque d'erreur si un signet est supprimé. | À éviter sauf si la figure est aussi supprimée. |
| 2. Compléter | Ajouter un titre après le séparateur. | Aucun changement. | L'entrée devient lisible. | Aucun changement. | **Recommandée.** |
| 3. Exclure de la table | Style non collecté ou champ `SEQ` neutralisé. | Si `SEQ` neutralisé : décalage possible. | L'entrée disparaît. | Variable. | Seulement avec une table fondée sur le style. |
| 4. Masquer | Police masquée ou texte blanc. | Aucun changement. | L'entrée peut rester. | Aucun changement. | Mesure provisoire, pas finale. |

### Option 1 — Supprimer les légendes vides

**Procédure.** Sélectionnez le paragraphe `Figure 7.3 :` et supprimez-le.

**Conséquences.**

- **Légendes avec champ `SEQ`** : le compteur perd une incrémentation. À la prochaine mise à jour (`F9`), toutes les figures suivantes sont renumérotées **une unité en moins**. Les renvois vers ces figures affichent le nouveau numéro ; les renvois vers la figure supprimée affichent `Erreur ! Source du renvoi introuvable.`
- **Légendes statiques (cas de ce rapport)** : rien n'est renuméroté automatiquement. La suite présente un trou : 7.2, puis 7.4. Il faut renuméroter à la main.
- **Table automatique** : l'entrée disparaît à la mise à jour.
- **Liste manuelle** : il faut supprimer la ligne correspondante à la main.

**Quand l'utiliser.** Uniquement si la figure elle-même est supprimée ou si vous acceptez de renuméroter et de corriger les renvois.

### Option 2 — Conserver et compléter

**Procédure.** Cliquez juste après le deux-points et saisissez un intitulé : `Figure 7.3 : Fichier docker-compose.yml`.

**Conséquences.**

- Aucun numéro ne change.
- Aucun renvoi n'est cassé.
- La table des figures affiche un libellé utile.
- La liste manuelle doit être mise à jour pour rester cohérente.

**C'est l'option retenue.** Les 12 légendes ont été complétées, les numéros sont inchangés, la liste manuelle a été mise à jour.

### Option 3 — Conserver mais exclure de la table des figures

C'est l'option la plus délicate, car Word ne propose pas de case « exclure de la table » sur une légende.

**Cas A — Table fondée sur `SEQ` (`TOC \c "Figure"`).** La table collecte tous les paragraphes contenant un champ `SEQ Figure`. Pour exclure une légende :

- **neutraliser le champ** en le convertissant en texte (`Ctrl+Maj+F9`) : la légende garde son numéro, mais le compteur `SEQ` perd une incrémentation ; les figures suivantes reculent de 1 à la prochaine mise à jour ;
- **changer l'identifiant** du champ (`SEQ FigureExclue \r n`) : la table ne le voit plus, mais il faut un champ `SEQ Figure` factice pour maintenir le compteur, solution fragile ;
- **accepter que l'entrée reste** : dans ce cas, l'option 3 n'est pas vraiment réalisée.

**Cas B — Table fondée sur le style (`TOC \t "Légende figure,1"`).** C'est la solution propre :

1. Créez un style de paragraphe `Légende exclue`, basé sur `Légende figure`.
2. Appliquez ce style à la légende à exclure.
3. Reconstruisez la table avec `Références > Insérer une table des illustrations > Options > Style`.
4. La légende reste visible, son champ `SEQ` et son numéro sont intacts, les figures suivantes ne bougent pas, les renvois fonctionnent, mais l'entrée n'est pas collectée.

**Conséquences communes.**

- Avec un champ `SEQ` neutralisé, les numéros suivants peuvent changer.
- Avec un style exclu, les numéros ne changent pas.
- Les renvois vers la légende exclue continuent de fonctionner si le signet est conservé.
- La liste manuelle doit être adaptée.

**Recommandation.** N'utilisez l'option 3 que si l'établissement exige une légende visible mais absente de la table. Dans ce rapport, la liste est manuelle : il suffit de ne pas y faire figurer la ligne, ce qui ne casse rien.

### Option 4 — Masquer sans supprimer

**Deux variantes.**

- **Texte masqué** : sélectionnez le texte de la légende, `Accueil > Police > Masquer` (ou `Ctrl+Maj+H`). Le texte n'est plus affiché ni imprimé si l'option d'impression du texte masqué est désactivée.
- **Texte blanc** : changez la couleur de police en blanc. Le texte reste présent, sélectionnable et copiable, mais invisible sur fond blanc.

**Conséquences.**

- La numérotation et les renvois sont intacts.
- La ligne peut continuer à occuper de la place (le texte masqué n'est pas toujours replié).
- La table des figures peut continuer à inclure l'entrée si le champ `SEQ` est présent.
- À l'export PDF, le texte masqué peut être absent ou présent selon les options ; le texte blanc est présent mais invisible.
- Accessibilité : un lecteur d'écran peut lire le texte masqué.

**Quand l'utiliser.** Pour un brouillon ou une mise en page temporaire, pas pour le dépôt final.

## 6.6 Ce qui a été appliqué

1. Les 12 légendes ont été complétées par les intitulés du tableau 6.4.
2. Le style des légendes vides a été harmonisé sur `Légende figure` (style `Lgendefigure` dans le DOCX).
3. Les 12 entrées correspondantes de la **LISTE DES FIGURES** ont été complétées avec les mêmes intitulés, en conservant la tabulation. Les numéros de page des deux listes (figures et tableaux) ont été recalculés par **−15** : l'ancienne introduction, page absolue 16, devient la page 1 du corps ; une figure anciennement page 77 est donc nouvelle page 62.
4. Aucun numéro de figure n'a été modifié.
5. Aucun champ `SEQ` n'a été ajouté ni supprimé.
6. Aucun renvoi n'a été touché.

> **✅ Résultat — Résultat**
>
> Il ne reste **aucune légende vide**. La liste manuelle ne contient plus de ligne « Figure 7.x : » sans intitulé. La pagination n'est pas affectée par ces modifications, car elles ne changent pas le nombre de pages de la section 2.


## 6.7 Et si vous voulez une vraie table des figures automatique ?

Il faut convertir les légendes en champs `SEQ`. Deux stratégies sont possibles.

### Stratégie 1 — Numérotation continue

- Chaque légende devient `Figure { SEQ Figure } : Titre`.
- Les figures sont numérotées 1 à 26, sans lien avec les chapitres.
- La table se construit avec `Références > Insérer une table des illustrations`, légende `Figure`.
- Les renvois fonctionnent.
- Inconvénient : les numéros ne correspondent plus au schéma `7.3`.

### Stratégie 2 — Numérotation par chapitre

- Le préfixe `Figure 7.` reste statique ; le numéro mineur est un champ `SEQ Figure \r 3` (reset à 3 pour la figure 7.3).
- Ou bien on utilise `SEQ Figure \s 1` avec un style de titre de chapitre numéroté automatiquement.
- La table se construit avec `TOC \c "Figure"`.
- Inconvénient : les `\r` sont des valeurs fixes ; l'insertion d'une figure oblige à ajuster les resets.

Dans les deux cas :

1. Travaillez sur une copie.
2. Convertissez une ou deux légendes pour tester.
3. Vérifiez la table et les renvois.
4. Ne convertissez le reste qu'après validation.
5. Mettez à jour les champs (`Ctrl+A`, `F9`) et la table.

> **⚠️ Attention — Pourquoi ce n'est pas fait dans le document corrigé**
>
> Le schéma `Figure 7.3` repose sur des numéros de chapitre saisis manuellement (`CHAPITRE VII`), et non sur une numérotation automatique des titres. Une conversion `SEQ` automatique produirait soit une numérotation continue (1 à 26), soit des resets manuels. Cela changerait l'apparence des légendes et de la liste, alors que la consigne était de ne pas toucher aux numéros. La conversion est donc laissée en option, documentée mais non appliquée.


# 7. Mise à jour des champs et vérification finale

## 7.1 Mettre à jour tous les champs

### Dans le corps du document

1. Cliquez dans le corps.
2. `Ctrl+A` pour tout sélectionner.
3. `F9`.
4. Si Word demande « Mettre à jour la table des matières ? », choisissez **Mettre à jour toute la table**.

### Dans les en-têtes et pieds de page

`Ctrl+A` dans le corps **ne sélectionne pas** les en-têtes et pieds. Il faut les mettre à jour séparément :

1. Double-cliquez dans un en-tête ou un pied.
2. `Ctrl+A`.
3. `F9`.
4. Répétez pour chaque section, ou utilisez la macro `MettreAJourTousLesChamps`.

### Après la mise à jour

1. Vérifiez que les numéros de page sont toujours corrects.
2. Si la section 2 a changé de nombre de pages, relancez `RecalerRepriseRomaine`.
3. Vérifiez la table des matières et la liste des figures.

> **⚠️ Attention — L'ordre des opérations**
>
> Mettez à jour les champs **après** avoir terminé la mise en page et les légendes. Une mise à jour peut modifier la pagination (notamment la table des matières), donc il faut recaler la reprise romaine **après**.


## 7.2 Mettre à jour la table des matières

1. Cliquez dans la table des matières (le sommaire de la section 2 ou la table finale de la section 4).
2. `F9`.
3. Choisissez **Mettre à jour toute la table**.
4. Vérifiez les numéros des entrées : les pages liminaires doivent être en romain, le corps en arabe, la bibliographie en romain à partir de XII.

Si la table ne se met pas à jour :

- vérifiez qu'elle est bien un champ `TOC` et non du texte ;
- `Alt+F9` pour voir `{ TOC \o "1-3" \h \z \u }` ;
- `F9` sur le champ.

## 7.3 Mettre à jour la liste des figures

Dans ce rapport, la liste est **manuelle**. Il n'y a donc pas de « mise à jour » automatique : il faut corriger les lignes à la main.

1. Ouvrez la page « LISTE DES FIGURES ».
2. Vérifiez que chaque ligne correspond à une légende existante.
3. Vérifiez qu'aucune ligne n'est vide après le deux-points.
4. Vérifiez les numéros de page. Dans le document corrigé, ils ont été recalculés par **−15** (ancienne introduction page 16 → nouvelle page 1). Ce calcul suppose que le corps conserve exactement la même mise en page ; après le premier rendu Word, ouvrez la liste, placez le curseur sur chaque numéro et corrigez-le si le rendu a décalé une page.

> **⚠️ Attention — Pourquoi un calcul et non une observation ?**
>
> Le sandbox de préparation ne contient ni Word ni LibreOffice : aucun rendu PDF n'a pu être produit. Les numéros de la liste ont donc été dérivés de l'ancienne pagination (TOC et pieds de page en cache), pas observés. Le décalage de −15 est exact si et seulement si le corps n'a pas changé de nombre de pages entre l'ancien rendu et le nouveau. Les légendes complétées tiennent sur la ligne existante, donc ce devrait être le cas ; vérifiez néanmoins les 51 lignes (38 figures + 13 tableaux) après le premier F9.


Si vous créez plus tard une table automatique :

1. Placez le curseur à l'emplacement de la table.
2. **Références > Insérer une table des illustrations**.
3. **Légende** : `Figure`.
4. Cochez **Afficher les numéros de page**.
5. Choisissez **Alignement à droite avec points de suite**.
6. **OK**.
7. `F9` pour actualiser.

## 7.4 Vérifier les renvois

Dans le rapport fourni, il n'y a **aucun champ `REF`** : les mentions de figures sont du texte. Il n'y a donc rien à casser.

Si vous ajoutez des renvois :

1. **Références > Renvoi**.
2. **Type** : `Figure`.
3. **Insérer une référence à** : `Numéro de l'élément` (ou `Page`).
4. Cochez **Insérer comme lien hypertexte** si souhaité.
5. **Insérer**.

Après une modification :

1. `Ctrl+A`, `F9`.
2. Recherchez `Erreur !` (`Ctrl+F`).
3. Si un renvoi est cassé, supprimez-le et réinsérez-le.

## 7.5 Contrôle page par page

### Méthode rapide

1. `Ctrl+Origine` pour aller au début.
2. Faites défiler avec `Page suivante`.
3. À chaque transition de section, vérifiez le numéro et sa position.
4. Notez les anomalies dans la fiche de contrôle (7.6).

### Méthode par impression

1. `Fichier > Imprimer`.
2. Affichez **Plusieurs pages par feuille** (2 ou 4) pour voir les transitions.
3. Vérifiez :
   - l'absence de numéro sur la page de garde, le CV et l'avant-propos ;
   - le passage de XI à 1 à l'introduction ;
   - le passage de N à XII à la bibliographie ;
   - la position (pied ou en-tête).

### Méthode par export PDF

1. `Fichier > Exporter > Créer PDF/XPS`.
2. Ouvrez le PDF.
3. Vérifiez les numéros dans la visionneuse et dans les propriétés.
4. Comptez les pages : le nombre doit correspondre à la dernière page physique, pas au dernier numéro affiché.

## 7.6 Fiche de contrôle

| Contrôle | Attendu | Constaté | OK |
|---|---|---|---|
| Nombre de sections | 4 |  |  |
| Page de garde | Aucun numéro |  |  |
| CV | Aucun numéro |  |  |
| Avant-propos | Aucun numéro |  |  |
| Première page des remerciements | I, pied centré |  |  |
| Dernière page du sommaire | XI, pied centré |  |  |
| Première page de l'introduction | 1, pied centré |  |  |
| Dernière page de la conclusion | N, pied centré |  |  |
| Première page de la bibliographie | XII, en-tête centré |  |  |
| Dernière page du document | Romain, en-tête centré |  |  |
| Doublons de I | Aucun |  |  |
| Saut entre XI et XII | Aucun |  |  |
| Champs PAGE | Présents, pas de texte tapé |  |  |
| En-têtes/pieds liés | Non |  |  |
| Légendes vides | 0 |  |  |
| Liste des figures | 0 ligne vide |  |  |
| Renvois | Aucune erreur |  |  |
| Export PDF | Conforme |  |  |

## 7.7 Ce qu'il faut vérifier dans le document corrigé

| Élément | Valeur attendue |
|---|---|
| `sectPr` dans le document | 4 |
| Section 1 | Aucune référence d'en-tête/pied, aucun `pgNumType` |
| Section 2 | `footerReference`, `pgNumType fmt="upperRoman" start="1"` |
| Section 3 | `footerReference`, `pgNumType fmt="decimal" start="1"` |
| Section 4 | `headerReference`, `footerReference` vide, `pgNumType fmt="upperRoman" start="12"` |
| Légendes vides | 0 |
| Entrées de liste complétées | 12 |
| Images | 43 objets, 41 images en ligne |
| Tableaux | 16 |

# 8. Pièges à éviter

1. **Confondre saut de page et saut de section.** Un saut de page (`Ctrl+Entrée`) ne crée pas de section et ne permet pas de changer le format de numérotation.
2. **Supprimer un saut de section sans insérer de saut de page.** Le contenu suivant remonte et la mise en page est cassée.
3. **Laisser « Lier au précédent » actif.** Le numéro de la section précédente s'affiche, et toute modification se propage.
4. **Taper les numéros à la main.** Ils ne suivent pas la pagination. Utilisez toujours `{ PAGE }`.
5. **Choisir « Continuer depuis la section précédente » pour la bibliographie.** Word continue le compteur arabe du corps et affiche LXXXVI au lieu de XII.
6. **Régler le format dans la mauvaise section.** La boîte s'applique à la section où se trouve le curseur.
7. **Oublier de mettre à jour les en-têtes/pieds.** `Ctrl+A` dans le corps ne les sélectionne pas.
8. **Laisser « Première page différente » cochée.** La première page de la section n'a pas de numéro.
9. **Laisser « Pages paires et impaires différentes » cochée.** Une page sur deux n'a pas de numéro.
10. **Utiliser « Supprimer les numéros de page » pour la seule page de garde.** Cela supprime les numéros de tout le document.
11. **Confondre romain majuscule et minuscule.** `I` n'est pas `i` ; le format se règle dans la boîte, pas dans le texte.
12. **Oublier que le CV et l'avant-propos sont dans la section 1.** Ils ne sont pas numérotés, conformément à la structure choisie.
13. **Oublier que les pages de parties sont dans la section 3.** Elles sont numérotées en arabe avec le corps.
14. **Supprimer une légende avec `SEQ`.** Les figures suivantes reculent de 1 et les renvois peuvent casser.
15. **Neutraliser un champ `SEQ` pour exclure une légende.** Le compteur perd une incrémentation.
16. **Masquer une légende en croyant qu'elle disparaît de la table.** Le champ `SEQ` peut rester collecté.
17. **Oublier de mettre à jour la liste manuelle.** Les intitulés ajoutés aux légendes n'apparaissent pas automatiquement dans la liste.
18. **Modifier le sommaire après avoir réglé la bibliographie.** Le nombre de pages de la section 2 change, donc la valeur de départ aussi.
19. **Mettre à jour les champs avant d'avoir fini la mise en page.** Une mise à jour peut déplacer des pages.
20. **Exporter en PDF sans mettre à jour les champs.** Le PDF peut conserver les anciennes valeurs en cache.
21. **Oublier que les champs `PAGE` des en-têtes/pieds ne sont pas mis à jour par `Ctrl+A` dans le corps.** Utilisez la macro.
22. **Croire que la barre d'état affiche le numéro romain.** Elle affiche la page physique.
23. **Insérer un saut de section dans une table des matières.** La mise à jour du champ peut le supprimer. Placez la coupure dans un paragraphe ordinaire après le champ.
24. **Utiliser `NUMPAGES` pour « Page X sur Y ».** `NUMPAGES` compte toutes les pages, pas celles de la section.
25. **Enregistrer le rapport en `.docx` en croyant conserver les macros.** Un `.docx` ne stocke pas de VBA ; utilisez `.docm` ou importez le `.bas` à chaque session.
26. **Oublier de sauvegarder avant de lancer une macro.** Les macros modifient le document ; travaillez sur une copie.

# 9. Macros VBA

## 9.1 Installation

1. Ouvrez le rapport dans Word.
2. `Alt+F11` pour ouvrir l'éditeur VBA.
3. `Fichier > Importer un fichier…` et sélectionnez `macros_numerotation_rapport.bas`.
   - Ou : `Insertion > Module`, puis copiez le contenu du fichier.
4. Vérifiez que le module s'appelle `NumerotationRapport` et qu'il apparaît dans l'explorateur de projets.
5. Fermez l'éditeur VBA (`Alt+Q`).
6. Activez les macros si nécessaire : `Fichier > Options > Centre de gestion de la confidentialité > Paramètres des macros > Activer les macros`.
7. Enregistrez le document en `.docm` si vous voulez conserver les macros avec lui.

> **⚠️ Attention — Sécurité**
>
> N'exécutez jamais une macro sur l'original. Faites une copie, testez, vérifiez le résultat, puis appliquez à la version de travail.


## 9.2 Paramètres modifiables

En tête du module :

| Constante | Valeur par défaut | Rôle |
|---|---|---|
| `TITRE_REMERCIEMENTS` | `REMERCIEMENTS` | Titre utilisé par `CreerQuatreSections`. |
| `TITRE_INTRODUCTION` | `INTRODUCTION` | Idem. |
| `TITRE_BIBLIOGRAPHIE` | `BIBLIOGRAPHIE` | Idem. |
| `FORMAT_LIMINAIRES` | `RomainMajuscule` | Format de la section 2. |
| `FORMAT_CORPS` | `Arabe` | Format de la section 3. |
| `FORMAT_BIBLIO` | `RomainMajuscule` | Format de la section 4. |
| `POSITION_LIMINAIRES` | `Bas` | Pied centré. |
| `POSITION_CORPS` | `Bas` | Pied centré. |
| `POSITION_BIBLIO` | `Haut` | En-tête centré. |
| `DEPART_LIMINAIRES` | 1 | Départ de la section 2. |
| `DEPART_CORPS` | 1 | Départ de la section 3. |
| `DEPART_BIBLIO_AUTO` | 0 | Calcul automatique N + 1. |
| `DEPART_BIBLIO_FORCE` | 0 | Si > 0, impose la valeur (par exemple 12). |

## 9.3 Macro principale : `ConfigurerPaginationRapport`

Elle :

1. vérifie que le document contient **4 sections** ;
2. demande confirmation ;
3. pour chaque section :
   - désactive « Première page différente » et « Pages paires et impaires différentes » ;
   - délie les en-têtes et pieds de page ;
   - supprime les champs `PAGE` existants, sans toucher aux logos et textes fixes ;
   - applique le format et la valeur de départ ;
   - insère un champ `PAGE` centré en haut ou en bas selon la section ;
4. calcule la reprise romaine : `N + 1`, où N est le nombre de pages de la section 2 ;
5. met à jour les champs ;
6. affiche un rapport de contrôle.

Utilisation : `Alt+F8`, sélectionnez `ConfigurerPaginationRapport`, **Exécuter**.

## 9.4 Macro de recalage : `RecalerRepriseRomaine`

À lancer après toute modification de la section 2 (remerciements → sommaire) :

1. compte les pages de la section 2 ;
2. écrit `N + 1` dans la valeur de départ de la section 4 ;
3. met à jour les champs ;
4. affiche le résultat en chiffres arabes et romains.

## 9.5 Macro de diagnostic : `DiagnostiquerLegendesVides`

Elle produit un rapport dans un nouveau document :

- page, style, texte exact et présence d'un champ `SEQ` pour chaque légende vide ;
- nombre total de légendes de figures ;
- nombre de légendes avec `SEQ` ;
- nombre de légendes vides.

Utilisation : `Alt+F8`, `DiagnostiquerLegendesVides`, **Exécuter**.

## 9.6 Macro de traitement : `TraiterLegendesVides`

Quatre modes, à passer en argument :

| Mode | Effet |
|---|---|
| `SUPPRIMER` | Supprime le paragraphe de légende. |
| `COMPLETER` | Ajoute `[à compléter]` après le séparateur. |
| `MASQUER` | Applique la police masquée au texte de la légende. |
| `EXCLURE` | Applique le style `Légende exclue`. |

Pour lancer un mode précis, créez une petite macro d'appel :

```vba
Sub CompleterToutesLesLegendes()
    TraiterLegendesVides "COMPLETER"
End Sub
```

Ou modifiez l'argument dans l'appel. La macro demande confirmation et sauvegarde une annulation (`UndoRecord`).

> **⚠️ Attention — Mode EXCLURE**
>
> Le mode `EXCLURE` applique un style, mais ne reconstruit pas la table des figures. Avec une table fondée sur `\c "Figure"`, l'entrée peut subsister. Avec une table fondée sur le style, elle disparaît. Voir 6.5, option 3.


## 9.7 Macro de vérification : `VerifierPagination`

Affiche un tableau :

- numéro de section ;
- nombre de pages ;
- format ;
- valeur de départ ;
- dernier numéro attendu ;
- présence d'un champ `PAGE` en en-tête et en pied.

C'est le contrôle le plus rapide après une modification.

## 9.8 Macro de création : `CreerQuatreSections`

Pour un document qui ne contient **qu'une seule section** :

1. cherche les titres `REMERCIEMENTS`, `INTRODUCTION`, `BIBLIOGRAPHIE` ;
2. insère un saut de section **Page suivante** avant chacun ;
3. laisse le document avec 4 sections.

Elle ne s'utilise pas sur un document à 9 sections : utilisez la copie corrigée ou la procédure manuelle. Vérifiez toujours qu'aucune page blanche n'a été ajoutée.

## 9.9 Limites et précautions

- La macro **supprime uniquement les champs `PAGE`** ; elle préserve les logos, titres courants et autres textes fixes.
- Elle **ne devine pas** les titres : `CreerQuatreSections` cherche les libellés exacts.
- `CompterPagesSection` a besoin d'un document repaginé, en mode Page. Si le résultat est 0, affichez le document en mode Page et relancez.
- `RecalerRepriseRomaine` doit être relancé après toute modification de la section 2.
- La macro ne convertit pas les légendes statiques en champs `SEQ` : voir 6.7.
- Word pour Mac ne dispose pas toujours de `VBScript.RegExp` ; le diagnostic peut échouer. La procédure manuelle reste valable.
- Les macros ne sont pas enregistrées dans un `.docx` : utilisez un `.docm` ou réimportez le `.bas`.

# 10. Annexes

## 10.1 Annexe A — Correspondance des menus français / anglais

| Action | Word français | Word anglais |
|---|---|---|
| Afficher les marques | Accueil > ¶ | Home > ¶ |
| Saut de section | Mise en page > Sauts > Sauts de section > Page suivante | Layout > Breaks > Section Breaks > Next Page |
| Saut de page | Ctrl+Entrée | Ctrl+Enter |
| Modifier l'en-tête | Double-clic dans l'en-tête | Double-click header |
| Délier | En-tête et pied de page > Lier au précédent | Header & Footer > Link to Previous |
| Première page différente | En-tête et pied de page > Options > Première page différente | Different First Page |
| Pages paires/impaires | Options > Pages paires et impaires différentes | Different Odd & Even Pages |
| Numéro de page | Insertion > Numéro de page | Insert > Page Number |
| Format des numéros | Insertion > Numéro de page > Format des numéros de page… | Format Page Numbers… |
| Bas de page centré | Numéro de page > Bas de page > Centré | Bottom of Page > Plain Number 2 |
| Haut de page centré | Numéro de page > Haut de page > Centré | Top of Page > Plain Number 2 |
| Codes de champ | Alt+F9 | Alt+F9 |
| Mettre à jour | F9 | F9 |
| Insérer une légende | Références > Insérer une légende | References > Insert Caption |
| Table des illustrations | Références > Insérer une table des illustrations | Insert Table of Figures |
| Renvoi | Références > Renvoi | Cross-reference |
| Mettre à jour la table | Références > Mettre à jour la table | Update Table |
| Caractères génériques | Remplacer > Plus >> > Utiliser les caractères génériques | Use wildcards |
| Police masquée | Accueil > Police > Masquer | Hidden |

## 10.2 Annexe B — Audit technique du document corrigé

| Contrôle | Résultat |
|---|---|
| Archive DOCX valide | Oui (`zipfile.testzip()` sans erreur). |
| Parties d'en-tête/pied ajoutées | `header1.xml`, `footer21.xml`, `footer22.xml`, `footer23.xml`. |
| Relations ajoutées | `rId901` à `rId904`. |
| Types de contenu | Overrides ajoutés pour les 4 parties. |
| Sections | 4. |
| Section 1 | Aucune référence d'en-tête/pied, aucun `pgNumType`. |
| Section 2 | `footerReference` `rId902`, `pgNumType fmt="upperRoman" start="1"`. |
| Section 3 | `footerReference` `rId903`, `pgNumType fmt="decimal" start="1"`. |
| Section 4 | `headerReference` `rId901`, `footerReference` `rId904` (vide), `pgNumType fmt="upperRoman" start="12"`. |
| Mise à jour des champs à l'ouverture | `w:updateFields w:val="true"`. |
| Légendes vides restantes | 0. |
| Entrées de liste complétées | 12. |
| Numéros de page des listes | 51 lignes recalées de −15 (38 figures + 13 tableaux). |
| Images | 43 objets, 41 images en ligne. |
| Tableaux | 16. |
| Paragraphes | 940 (939 dans la source + 1 paragraphe de coupure de 1 pt). |
| Contenu rédactionnel | Non modifié, hors légendes et liste des figures. |

> **⚠️ Attention — Validation visuelle**
>
> La structure OOXML est valide, mais aucun moteur de rendu Word n'était disponible. Ouvrez le fichier dans Word, acceptez la mise à jour des champs, puis contrôlez les transitions de pages. Si Word propose de réparer le fichier, ne l'enregistrez pas : signalez-le et repartez du fichier source.


## 10.3 Annexe C — Check-list imprimable

| # | Vérification | Fait |
|---|---|---|
| 1 | Copie de sauvegarde créée | ☐ |
| 2 | Marques de mise en forme affichées | ☐ |
| 3 | 4 sections exactement | ☐ |
| 4 | Section 1 sans en-tête/pied | ☐ |
| 5 | Section 2 déliée, pied centré, `I, II, III`, départ 1 | ☐ |
| 6 | Section 3 déliée, pied centré, `1, 2, 3`, départ 1 | ☐ |
| 7 | Section 4 déliée, en-tête centré, `I, II, III`, départ 12 | ☐ |
| 8 | Pied de la section 4 vide | ☐ |
| 9 | Page de garde sans numéro | ☐ |
| 10 | CV et avant-propos sans numéro | ☐ |
| 11 | Transition XI → 1 à l'introduction | ☐ |
| 12 | Transition N → XII à la bibliographie | ☐ |
| 13 | Aucun doublon de I | ☐ |
| 14 | Champs `PAGE` et non texte tapé | ☐ |
| 15 | En-têtes/pieds non liés | ☐ |
| 16 | Aucune légende vide | ☐ |
| 17 | Liste des figures complète | ☐ |
| 18 | Renvois sans erreur | ☐ |
| 19 | Champs mis à jour (`Ctrl+A`, `F9`) | ☐ |
| 20 | Export PDF contrôlé | ☐ |

## 10.4 Annexe D — Code VBA complet

Le module ci-dessous est reproduit à l'identique depuis `macros_numerotation_rapport.bas`.

```vb
Attribute VB_Name = "NumerotationRapport"
Option Explicit

'=====================================================================
' MODULE  : NumerotationRapport
' OBJET   : numerotation des pages et traitement des legendes vides
' VERSION : 1.0 - 7 novembre 2026
' WORD    : 2016, 2019, 2021, Microsoft 365 (Windows)
'
' PRINCIPE
'   Le document doit contenir exactement 4 sections :
'     1. page de garde -> avant-propos        (aucun numero)
'     2. remerciements -> sommaire            (romain majuscule, I..)
'     3. introduction -> conclusion           (arabe, 1..)
'     4. bibliographie -> fin du document     (romain majuscule, reprise)
'
'   La macro ne devine pas les titres : elle travaille sur les sections
'   existantes. Utiliser d'abord CreerQuatreSections sur un document
'   qui ne contient qu'une section, ou la copie corrigee fournie.
'
' IMPORTANT
'   - Toujours travailler sur une copie.
'   - Les numeros sont des champs PAGE, jamais du texte tape.
'   - Apres toute modification du sommaire, relancer RecalerRepriseRomaine.
'=====================================================================

'---------------------------------------------------------------------
' 1. PARAMETRES MODIFIABLES
'---------------------------------------------------------------------
Public Const TITRE_REMERCIEMENTS As String = "REMERCIEMENTS"
Public Const TITRE_INTRODUCTION As String = "INTRODUCTION"
Public Const TITRE_BIBLIOGRAPHIE As String = "BIBLIOGRAPHIE"

' Formats acceptes : "RomainMajuscule", "RomainMinuscule", "Arabe", "Aucun"
Public Const FORMAT_LIMINAIRES As String = "RomainMajuscule"
Public Const FORMAT_CORPS As String = "Arabe"
Public Const FORMAT_BIBLIO As String = "RomainMajuscule"

' Positions acceptees : "Haut", "Bas", "HautDroite", "BasDroite"
Public Const POSITION_LIMINAIRES As String = "Bas"
Public Const POSITION_CORPS As String = "Bas"
Public Const POSITION_BIBLIO As String = "Haut"

Public Const DEPART_LIMINAIRES As Long = 1
Public Const DEPART_CORPS As Long = 1

' 0 = calcul automatique : (nombre de pages de la section 2) + 1
Public Const DEPART_BIBLIO_AUTO As Long = 0

' Mettre par exemple 12 pour imposer XII, sinon laisser 0.
Public Const DEPART_BIBLIO_FORCE As Long = 0

' Style applique aux legendes vides en mode EXCLURE

'---------------------------------------------------------------------
' 2. MACRO PRINCIPALE
'---------------------------------------------------------------------
Public Sub ConfigurerPaginationRapport()
    Dim doc As Document
    Dim departBiblio As Long

    On Error GoTo Erreur
    Set doc = ActiveDocument

    If doc.Sections.Count <> 4 Then
        MsgBox "Ce rapport doit contenir exactement 4 sections." & vbCrLf & _
               "Sections trouvees : " & doc.Sections.Count & vbCrLf & vbCrLf & _
               "Utilisez la copie corrigee ou la macro CreerQuatreSections", _
               vbExclamation, "Structure incorrecte"
        Exit Sub
    End If

    If MsgBox("Configurer la numerotation des 4 sections ?" & vbCrLf & _
              "Une sauvegarde prealable est conseillee.", _
              vbYesNo + vbQuestion, "Numerotation du rapport") <> vbYes Then
        Exit Sub
    End If

    Application.ScreenUpdating = False
    Application.UndoRecord.StartCustomRecord "Numerotation du rapport"

    ' Section 1 : aucune numero visible
    ConfigurerUneSection doc.Sections(1), "Aucun", 0, "Aucun"

    ' Section 2 : remerciements -> sommaire
    ConfigurerUneSection doc.Sections(2), FORMAT_LIMINAIRES, DEPART_LIMINAIRES, POSITION_LIMINAIRES

    ' Section 3 : introduction -> conclusion
    ConfigurerUneSection doc.Sections(3), FORMAT_CORPS, DEPART_CORPS, POSITION_CORPS

    ' Section 4 : bibliographie -> fin
    If DEPART_BIBLIO_FORCE > 0 Then
        departBiblio = DEPART_BIBLIO_FORCE
    Else
        departBiblio = CompterPagesSection(doc.Sections(2)) + 1
    End If
    ConfigurerUneSection doc.Sections(4), FORMAT_BIBLIO, departBiblio, POSITION_BIBLIO

    MettreAJourTousLesChamps doc

    Application.UndoRecord.EndCustomRecord
    Application.ScreenUpdating = True

    VerifierPagination doc
    Exit Sub

Erreur:
    Application.ScreenUpdating = True
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical, "Numerotation"
End Sub

'---------------------------------------------------------------------
' 3. CONFIGURATION D'UNE SECTION
'---------------------------------------------------------------------
Private Sub ConfigurerUneSection(ByVal sec As Section, _
                                 ByVal fmt As String, _
                                 ByVal depart As Long, _
                                 ByVal position As String)
    Dim hf As HeaderFooter

    ' Desactiver les variantes qui masquent le numero sur certaines pages
    sec.PageSetup.DifferentFirstPageHeaderFooter = False
    sec.PageSetup.OddAndEvenPagesHeaderFooter = False

    ' Delier tous les en-tetes et pieds de page, puis vider
    For Each hf In sec.Headers
        hf.LinkToPrevious = False
        ViderHeaderFooter hf
    Next hf
    For Each hf In sec.Footers
        hf.LinkToPrevious = False
        ViderHeaderFooter hf
    Next hf

    ' Format de numerotation
    Select Case fmt
        Case "RomainMajuscule"
            sec.PageNumbers.NumberStyle = wdPageNumberStyleUppercaseRoman
        Case "RomainMinuscule"
            sec.PageNumbers.NumberStyle = wdPageNumberStyleLowercaseRoman
        Case "Arabe"
            sec.PageNumbers.NumberStyle = wdPageNumberStyleArabic
        Case "Aucun"
            ' On ne touche pas au format : aucun champ ne sera affiche.
        Case Else
            MsgBox "Format inconnu : " & fmt, vbExclamation
    End Select

    ' Valeur de depart
    If fmt <> "Aucun" And depart > 0 Then
        sec.PageNumbers.RestartNumberingAtSection = True
        sec.PageNumbers.StartingNumber = depart
    ElseIf fmt = "Aucun" Then
        sec.PageNumbers.RestartNumberingAtSection = False
    End If

    ' Champ PAGE dans l'en-tete ou le pied de page
    If fmt <> "Aucun" Then
        Select Case position
            Case "Haut"
                AjouterChampPAGE sec.Headers(wdHeaderFooterPrimary), wdAlignParagraphCenter
            Case "HautDroite"
                AjouterChampPAGE sec.Headers(wdHeaderFooterPrimary), wdAlignParagraphRight
            Case "Bas"
                AjouterChampPAGE sec.Footers(wdHeaderFooterPrimary), wdAlignParagraphCenter
            Case "BasDroite"
                AjouterChampPAGE sec.Footers(wdHeaderFooterPrimary), wdAlignParagraphRight
            Case "Aucun"
                ' rien
            Case Else
                MsgBox "Position inconnue : " & position, vbExclamation
        End Select
    End If
End Sub

Private Sub ViderHeaderFooter(ByVal hf As HeaderFooter)
    ' Supprime uniquement les champs PAGE : les logos, titres courants et
    ' autres textes fixes de l'en-tete ou du pied de page sont preserves.
    Dim i As Long

    On Error Resume Next
    For i = hf.Range.Fields.Count To 1 Step -1
        If EstChampPAGE(hf.Range.Fields(i).Code) Then
            hf.Range.Fields(i).Delete
        End If
    Next i
    On Error GoTo 0
End Sub

Private Sub AjouterChampPAGE(ByVal hf As HeaderFooter, _
                             ByVal alignement As WdParagraphAlignment)
    Dim r As Range

    ' Si l'en-tete/pied ne contient que des marques de paragraphe,
    ' on utilise le premier paragraphe ; sinon on ajoute une ligne.
    If Len(Trim$(Replace(hf.Range.Text, Chr$(13), ""))) = 0 Then
        Set r = hf.Range
    Else
        Set r = hf.Range.Paragraphs.Add.Range
    End If

    r.ParagraphFormat.Alignment = alignement
    r.Collapse wdCollapseStart
    hf.Range.Fields.Add Range:=r, Type:=wdFieldPage
End Sub

'---------------------------------------------------------------------
' 4. COMPTAGE DES PAGES D'UNE SECTION
'---------------------------------------------------------------------
Public Function CompterPagesSection(ByVal sec As Section) As Long
    Dim pDeb As Long
    Dim pFin As Long

    On Error GoTo Erreur

    pDeb = sec.Range.Paragraphs(1).Range.Information(wdActiveEndPageNumber)

    With sec.Range.Paragraphs(sec.Range.Paragraphs.Count).Range
        pFin = .Information(wdActiveEndPageNumber)
    End With

    If pFin < pDeb Then pFin = pDeb
    CompterPagesSection = pFin - pDeb + 1
    Exit Function

Erreur:
    CompterPagesSection = 0
End Function

'---------------------------------------------------------------------
' 5. RECALAGE DE LA REPRISE ROMAINE
'---------------------------------------------------------------------
Public Sub RecalerRepriseRomaine()
    Dim doc As Document
    Dim nbPages As Long
    Dim depart As Long

    On Error GoTo Erreur
    Set doc = ActiveDocument

    If doc.Sections.Count < 4 Then
        MsgBox "Le document doit comporter 4 sections.", vbExclamation
        Exit Sub
    End If

    nbPages = CompterPagesSection(doc.Sections(2))
    If nbPages < 1 Then
        MsgBox "Impossible de compter les pages de la section 2." & vbCrLf & _
               "Verifiez que le document est affiche en mode Page.", vbExclamation
        Exit Sub
    End If

    depart = nbPages + 1

    With doc.Sections(4).PageNumbers
        .RestartNumberingAtSection = True
        .StartingNumber = depart
    End With

    MettreAJourTousLesChamps doc

    MsgBox "Section 2 (remerciements -> sommaire) : " & nbPages & " page(s)." & vbCrLf & _
           "La section 4 (bibliographie) redemarre donc a " & depart & _
           " (" & EnRomain(depart) & ")." & vbCrLf & vbCrLf & _
           "Consequence : la bibliographie affiche " & EnRomain(depart) & _
           ", " & EnRomain(depart + 1) & ", etc.", _
           vbInformation, "Reprise romaine recalee"
    Exit Sub

Erreur:
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical
End Sub

'---------------------------------------------------------------------
' 6. VERIFICATION DE LA PAGINATION
'---------------------------------------------------------------------
Public Sub VerifierPagination(Optional ByVal doc As Document)
    Dim sec As Section
    Dim i As Long
    Dim n As Long
    Dim dep As Long
    Dim msg As String

    On Error GoTo Erreur
    If doc Is Nothing Then Set doc = ActiveDocument

    msg = "SECTION | PAGES | FORMAT | DEPART | DERNIER | EN-TETE | PIED" & vbCrLf
    msg = msg & String(78, "-") & vbCrLf

    For i = 1 To doc.Sections.Count
        Set sec = doc.Sections(i)
        n = CompterPagesSection(sec)
        dep = sec.PageNumbers.StartingNumber

        msg = msg & i & " | " & n & " | " & _
              NomFormat(sec.PageNumbers.NumberStyle) & " | " & dep & " | " & _
              DernierNumero(dep, n, sec.PageNumbers.NumberStyle) & " | " & _
              EtatChampPAGE(sec.Headers(wdHeaderFooterPrimary)) & " | " & _
              EtatChampPAGE(sec.Footers(wdHeaderFooterPrimary)) & vbCrLf
    Next i

    msg = msg & vbCrLf & "Attendu :" & vbCrLf & _
          "  section 1 : aucun numero (page de garde + avant-propos)" & vbCrLf & _
          "  section 2 : I a XI en pied centre (11 pages)" & vbCrLf & _
          "  section 3 : 1 a N en pied centre" & vbCrLf & _
          "  section 4 : XII et suivants en en-tete centre"

    MsgBox msg, vbInformation, "Verification de la pagination"
    Exit Sub

Erreur:
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical
End Sub

'---------------------------------------------------------------------
' 7. DIAGNOSTIC DES LEGENDES VIDES
'---------------------------------------------------------------------
Public Sub DiagnostiquerLegendesVides()
    Dim doc As Document
    Dim p As Paragraph
    Dim s As String
    Dim rapport As String
    Dim nVides As Long
    Dim nTotal As Long
    Dim nSeq As Long

    On Error GoTo Erreur
    Set doc = ActiveDocument

    rapport = "DIAGNOSTIC DES LEGENDES DE FIGURES" & vbCrLf & _
              "Document : " & doc.Name & vbCrLf & _
              String(72, "=") & vbCrLf & vbCrLf

    For Each p In doc.Paragraphs
        s = NettoyerTexte(p.Range.Text)
        If EstLegendeFigure(p, s) Then
            nTotal = nTotal + 1
            If ContientSEQFigure(p) Then nSeq = nSeq + 1

            If EstLegendeVide(s) Then
                nVides = nVides + 1
                rapport = rapport & "Legende vide n" & nVides & vbCrLf & _
                          "  Page      : " & p.Range.Information(wdActiveEndPageNumber) & vbCrLf & _
                          "  Style     : " & p.Style.NameLocal & vbCrLf & _
                          "  Texte     : [" & s & "]" & vbCrLf & _
                          "  Champ SEQ : " & IIf(ContientSEQFigure(p), "oui", "non") & vbCrLf & vbCrLf
            End If
        End If
    Next p

    rapport = rapport & String(72, "-") & vbCrLf & _
              "Legendes de figures detectees : " & nTotal & vbCrLf & _
              "Dont avec champ SEQ Figure    : " & nSeq & vbCrLf & _
              "Dont vides                    : " & nVides & vbCrLf & vbCrLf & _
              "Rappel : les entrees de la liste des figures (avec tabulation)" & vbCrLf & _
              "sont ignorees. Une legende vide contient un numero mais aucun" & vbCrLf & _
              "texte apres le separateur (deux-points ou tiret)."

    AfficherRapport rapport
    Exit Sub

Erreur:
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical
End Sub

Private Function EstLegendeFigure(ByVal p As Paragraph, ByVal s As String) As Boolean
    Dim st As String
    Dim motLegende As String

    st = LCase$(p.Style.NameLocal)
    ' "legende" construit avec ChrW pour rester en ASCII dans le fichier .bas.
    motLegende = LCase$("L" & ChrW(&HE9) & "gende")

    If InStr(st, motLegende) > 0 Then
        If InStr(st, "tableau") = 0 Then EstLegendeFigure = True
        Exit Function
    End If

    If InStr(st, "caption") > 0 Then
        If LCase$(Left$(s, 6)) = "figure" Then EstLegendeFigure = True
        Exit Function
    End If

    ' Une entree de liste manuelle contient une tabulation avant le numero de page.
    If InStr(p.Range.Text, Chr$(9)) > 0 Then Exit Function

    If LCase$(Left$(s, 6)) = "figure" Then EstLegendeFigure = True
End Function

Private Function EstLegendeVide(ByVal s As String) As Boolean
    Static re As Object

    If re Is Nothing Then
        Set re = CreateObject("VBScript.RegExp")
        re.Global = False
        re.IgnoreCase = True
        re.Pattern = "^\s*Figure\s*([0-9]+([.\-][0-9]+)?[a-zA-Z]?)?\s*[:\-" & _
                     ChrW(&H2013) & ChrW(&H2014) & "]?\s*$"
    End If

    EstLegendeVide = re.Test(s)
End Function

Private Function ContientSEQFigure(ByVal p As Paragraph) As Boolean
    Dim f As Field

    For Each f In p.Range.Fields
        If InStr(UCase$(f.Code), "SEQ FIGURE") > 0 Then
            ContientSEQFigure = True
            Exit Function
        End If
    Next f
End Function

Private Sub AfficherRapport(ByVal texte As String)
    Dim rep As Document

    Set rep = Documents.Add
    rep.Content.Text = texte
    rep.Content.Font.Name = "Consolas"
    rep.Content.Font.Size = 9
    rep.Paragraphs(1).Range.Font.Bold = True
    rep.Paragraphs(1).Range.Font.Size = 12
End Sub

'---------------------------------------------------------------------
' 8. TRAITEMENT DES LEGENDES VIDES
'    mode = "SUPPRIMER", "COMPLETER", "MASQUER" ou "EXCLURE"
'---------------------------------------------------------------------
Public Sub TraiterLegendesVides(ByVal mode As String)
    Dim doc As Document
    Dim i As Long
    Dim p As Paragraph
    Dim s As String
    Dim n As Long

    On Error GoTo Erreur
    Set doc = ActiveDocument
    mode = UCase$(Trim$(mode))

    If mode <> "SUPPRIMER" And mode <> "COMPLETER" And _
       mode <> "MASQUER" And mode <> "EXCLURE" Then
        MsgBox "Mode inconnu : " & mode & vbCrLf & _
               "Utilisez SUPPRIMER, COMPLETER, MASQUER ou EXCLURE.", _
               vbExclamation, "Traitement des legendes"
        Exit Sub
    End If

    If MsgBox("Appliquer le mode """ & mode & """ a toutes les legendes vides ?" & vbCrLf & _
              "Sauvegardez le document avant de continuer.", _
              vbYesNo + vbQuestion, "Traitement des legendes") <> vbYes Then
        Exit Sub
    End If

    Application.ScreenUpdating = False
    Application.UndoRecord.StartCustomRecord "Traitement des legendes vides"

    ' Parcours descendant : indispensable pour les suppressions.
    For i = doc.Paragraphs.Count To 1 Step -1
        Set p = doc.Paragraphs(i)
        s = NettoyerTexte(p.Range.Text)

        If EstLegendeFigure(p, s) And EstLegendeVide(s) Then
            Select Case mode
                Case "SUPPRIMER"
                    p.Range.Delete
                    n = n + 1
                Case "COMPLETER"
                    CompleterLegende p
                    n = n + 1
                Case "MASQUER"
                    MasquerLegende p
                    n = n + 1
                Case "EXCLURE"
                    ExclureLegende doc, p
                    n = n + 1
            End Select
        End If
    Next i

    Application.UndoRecord.EndCustomRecord
    Application.ScreenUpdating = True

    MettreAJourTousLesChamps doc

    If mode = "SUPPRIMER" Then
        MsgBox n & " legende(s) supprimee(s)." & vbCrLf & vbCrLf & _
               "Les numeros des figures suivantes peuvent avoir change." & vbCrLf & _
               "Verifiez la table des figures et les renvois (Ctrl+A puis F9).", _
               vbInformation, "Legendes vides"
    ElseIf mode = "EXCLURE" Then
        MsgBox n & " legende(s) marquee(s) """ & NomStyleExclue() & """." & vbCrLf & vbCrLf & _
               "Une table des figures fondee sur le style est necessaire" & vbCrLf & _
               "(champ TOC \t ...). Avec une table fondee sur \c ""Figure""," & vbCrLf & _
               "l'entree peut subsister.", _
               vbInformation, "Legendes vides"
    Else
        MsgBox n & " legende(s) traitee(s) en mode " & mode & ".", _
               vbInformation, "Legendes vides"
    End If
    Exit Sub

Erreur:
    Application.ScreenUpdating = True
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical
End Sub

Private Sub CompleterLegende(ByVal p As Paragraph)
    Dim r As Range

    If InStr(1, p.Range.Text, "compl" & ChrW(&HE9) & "ter", vbTextCompare) > 0 Then Exit Sub

    Set r = p.Range
    If r.End > r.Start Then r.End = r.End - 1   ' exclut la marque de paragraphe
    r.InsertAfter " [" & ChrW(&HE0) & " compl" & ChrW(&HE9) & "ter]"
End Sub

Private Sub MasquerLegende(ByVal p As Paragraph)
    Dim r As Range

    Set r = p.Range
    If r.End > r.Start Then r.End = r.End - 1   ' on garde la marque visible
    r.Font.Hidden = True
End Sub

Private Sub ExclureLegende(ByVal doc As Document, ByVal p As Paragraph)
    Dim st As Style

    On Error Resume Next
    Set st = doc.Styles(NomStyleExclue())
    On Error GoTo 0

    If st Is Nothing Then
        Set st = doc.Styles.Add(Name:=NomStyleExclue(), Type:=wdStyleTypeParagraph)
        st.BaseStyle = p.Style.NameLocal
        st.Font.Hidden = False
    End If

    p.Style = st
End Sub

'---------------------------------------------------------------------
' 9. MISE A JOUR DES CHAMPS
'---------------------------------------------------------------------
Public Sub MettreAJourTousLesChamps(Optional ByVal doc As Document)
    Dim sec As Section
    Dim hf As HeaderFooter
    Dim toc As TableOfContents
    Dim tof As TableOfFigures

    If doc Is Nothing Then Set doc = ActiveDocument

    On Error Resume Next

    doc.Fields.Update

    For Each sec In doc.Sections
        For Each hf In sec.Headers
            hf.Range.Fields.Update
        Next hf
        For Each hf In sec.Footers
            hf.Range.Fields.Update
        Next hf
    Next sec

    For Each toc In doc.TablesOfContents
        toc.Update
    Next toc

    For Each tof In doc.TablesOfFigures
        tof.Update
    Next tof

    On Error GoTo 0
End Sub

'---------------------------------------------------------------------
' 10. CREATION DES QUATRE SECTIONS (document a une seule section)
'---------------------------------------------------------------------
Public Sub CreerQuatreSections()
    Dim doc As Document

    On Error GoTo Erreur
    Set doc = ActiveDocument

    If doc.Sections.Count > 1 Then
        MsgBox "Le document contient deja " & doc.Sections.Count & " sections." & vbCrLf & vbCrLf & _
               "Cette macro ne s'utilise que sur un document a une seule section." & vbCrLf & _
               "Pour un document a 9 sections, utilisez la copie corrigee ou" & vbCrLf & _
               "supprimez manuellement les sauts de section (voir guide).", _
               vbExclamation, "Structure existante"
        Exit Sub
    End If

    If MsgBox("Creer 4 sections a partir des titres REMERCIEMENTS, INTRODUCTION" & vbCrLf & _
              "et BIBLIOGRAPHIE ? Verifiez ensuite qu'aucune page blanche n'a ete ajoutee.", _
              vbYesNo + vbQuestion, "Creation des sections") <> vbYes Then
        Exit Sub
    End If

    InsererSautSectionAvant doc, TITRE_REMERCIEMENTS
    InsererSautSectionAvant doc, TITRE_INTRODUCTION
    InsererSautSectionAvant doc, TITRE_BIBLIOGRAPHIE

    MsgBox "4 sections creees. Lancez maintenant ConfigurerPaginationRapport.", _
           vbInformation, "Creation des sections"
    Exit Sub

Erreur:
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical
End Sub

Private Sub InsererSautSectionAvant(ByVal doc As Document, ByVal titre As String)
    Dim p As Paragraph
    Dim r As Range

    Set p = TrouverParagrapheTitre(doc, titre)
    If p Is Nothing Then
        MsgBox "Titre introuvable : " & titre, vbExclamation
        Exit Sub
    End If

    Set r = p.Range
    r.Collapse wdCollapseStart
    r.InsertBreak Type:=wdSectionBreakNextPage
End Sub

Private Function TrouverParagrapheTitre(ByVal doc As Document, ByVal titre As String) As Paragraph
    Dim p As Paragraph

    For Each p In doc.Paragraphs
        If StrComp(NettoyerTexte(p.Range.Text), titre, vbTextCompare) = 0 Then
            Set TrouverParagrapheTitre = p
            Exit Function
        End If
    Next p
End Function

'---------------------------------------------------------------------
' 11. OUTILS
'---------------------------------------------------------------------
Private Function NettoyerTexte(ByVal s As String) As String
    s = Replace(s, Chr$(13), "")
    s = Replace(s, Chr$(7), "")
    s = Replace(s, Chr$(12), "")
    s = Replace(s, Chr$(160), " ")
    s = Replace(s, vbTab, " ")
    NettoyerTexte = Trim$(s)
End Function

Private Function NomStyleExclue() As String
    ' Construit le nom du style sans caractere non ASCII dans le fichier .bas.
    NomStyleExclue = "L" & ChrW(&HE9) & "gende exclue"
End Function

Private Function NomFormat(ByVal style As WdPageNumberStyle) As String
    Select Case style
        Case wdPageNumberStyleArabic: NomFormat = "Arabe"
        Case wdPageNumberStyleUppercaseRoman: NomFormat = "Romain maj."
        Case wdPageNumberStyleLowercaseRoman: NomFormat = "Romain min."
        Case wdPageNumberStyleUppercaseLetter: NomFormat = "Lettre maj."
        Case wdPageNumberStyleLowercaseLetter: NomFormat = "Lettre min."
        Case Else: NomFormat = "Autre (" & style & ")"
    End Select
End Function

Private Function DernierNumero(ByVal depart As Long, ByVal nbPages As Long, _
                               ByVal style As WdPageNumberStyle) As String
    Dim n As Long

    If nbPages < 1 Then
        DernierNumero = "-"
        Exit Function
    End If

    n = depart + nbPages - 1

    Select Case style
        Case wdPageNumberStyleUppercaseRoman
            DernierNumero = EnRomain(n)
        Case wdPageNumberStyleLowercaseRoman
            DernierNumero = LCase$(EnRomain(n))
        Case Else
            DernierNumero = CStr(n)
    End Select
End Function

Private Function EtatChampPAGE(ByVal hf As HeaderFooter) As String
    Dim f As Field

    If hf.Range.Fields.Count = 0 Then
        EtatChampPAGE = "aucun"
        Exit Function
    End If

    For Each f In hf.Range.Fields
        If EstChampPAGE(f.Code) Then
            EtatChampPAGE = "PAGE"
            Exit Function
        End If
    Next f

    EtatChampPAGE = "autre"
End Function

Private Function EstChampPAGE(ByVal code As String) As Boolean
    Dim c As String

    c = UCase$(Trim$(code))
    EstChampPAGE = (c = "PAGE") Or (Left$(c, 5) = "PAGE ")
End Function

Public Function EnRomain(ByVal n As Long) As String
    Dim valeurs As Variant
    Dim symboles As Variant
    Dim i As Long
    Dim res As String

    valeurs = Array(1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1)
    symboles = Array("M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I")

    res = ""
    For i = LBound(valeurs) To UBound(valeurs)
        Do While n >= valeurs(i)
            res = res & symboles(i)
            n = n - valeurs(i)
        Loop
    Next i

    EnRomain = res
End Function
```

## 10.5 Annexe E — Fichiers et versions

| Fichier | Taille indicative | Rôle |
|---|---:|---|
| `rapport_stage_corrige_complet.docx` | 5,7 Mo | Source, non modifiée. |
| `rapport_stage_corrige_pagination.docx` | 5,4 Mo | Document corrigé. |
| `GUIDE_numerotation_pages_et_figures_Word.docx` | — | Guide Word. |
| `GUIDE_numerotation_pages_et_figures_Word.md` | — | Guide texte. |
| `macros_numerotation_rapport.bas` | 25 Ko | Module VBA. |

Version du guide : 1.0 — 7 novembre 2026.

> **ℹ️ Information — Contact technique**
>
> Pour toute anomalie de pagination dans Word, indiquez :
>
> - le numéro de section ;
> - le numéro affiché avant et après la transition ;
> - le format et la valeur de départ de la section ;
> - la présence ou l'absence de « Lier au précédent ».
>
> Ces quatre informations suffisent à diagnostiquer la majorité des cas.

