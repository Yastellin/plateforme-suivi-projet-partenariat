#!/usr/bin/env python3
"""
Convertit un document Markdown en PDF paginé (table des matières, en-têtes,
pieds de page) avec ReportLab.

Usage :
    python3 outils/markdown-vers-pdf.py docs/cahier-des-charges-v5.md docs/Cahier_des_charges_v5.pdf
    python3 outils/markdown-vers-pdf.py --chapitres-enchaines --toc-profondeur 1 source.md destination.pdf

Par défaut, chaque chapitre (titre de niveau 1) commence sur une nouvelle page.
L'option `--chapitres-enchaines` enchaîne les chapitres sans saut de page forcé :
utile pour les documents courts dont le nombre de pages est contraint.
L'option `--toc-profondeur n` (1 à 3, défaut 3) limite la table des matières aux
n premiers niveaux de titres : 1 = chapitres seuls, 2 = chapitres et sections,
3 = tous les niveaux.
L'option `--toc-sur-place` place la table des matières à la suite du contenu
précédent (fiche du document) au lieu de lui ouvrir une page : le sommaire
partage alors la page de la fiche, ce qui évite une page presque vide.

Le sous-ensemble de Markdown pris en charge est volontairement limité à ce
qu'utilise le cahier des charges :
  - titres `#`, `##`, `###`, `####`
  - paragraphes, gras `**...**`, code en ligne `` `...` ``
  - listes à puces `- ` et listes numérotées `1. `
  - citations `> `
  - règles horizontales `---`
  - blocs de code délimités par ```
  - tableaux `| ... |` avec ligne de séparation
  - marqueur `<!-- TOC -->` remplacé par une table des matières paginée
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    CondPageBreak,
    Frame,
    HRFlowable,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

# --------------------------------------------------------------------------
# Couleurs institutionnelles (alignées sur frontend/src/styles/design-tokens-uf.css)
# --------------------------------------------------------------------------
VERT_INSTITUTIONNEL = colors.HexColor("#047857")
VERT_PROFOND = colors.HexColor("#065F46")
OR_INSTITUTIONNEL = colors.HexColor("#FFC400")
GRIS_TEXTE = colors.HexColor("#052E1F")
GRIS_SECONDAIRE = colors.HexColor("#5B7A6B")
GRIS_BORDURE = colors.HexColor("#D6E5DC")
GRIS_FOND = colors.HexColor("#F4FAF6")

TITRE_PIED_DE_PAGE = (
    "Cahier des charges — Plateforme de gestion et de suivi des projets "
    "et partenariats de l'Université de Fianarantsoa — version 5"
)
LIBELLE_COURANT = TITRE_PIED_DE_PAGE

# --------------------------------------------------------------------------
# Polices
# --------------------------------------------------------------------------
DOSSIER_POLICES = Path("/usr/share/fonts/truetype/dejavu")


def enregistrer_polices() -> dict[str, str]:
    """Enregistre les polices DejaVu (support complet de l'Unicode)."""
    correspondance = {
        "normal": "DejaVuSans.ttf",
        "gras": "DejaVuSans-Bold.ttf",
        "italique": "DejaVuSans.ttf",
        "gras_italique": "DejaVuSans-Bold.ttf",
        "mono": "DejaVuSansMono.ttf",
        "mono_gras": "DejaVuSansMono-Bold.ttf",
        "serif": "DejaVuSerif.ttf",
        "serif_gras": "DejaVuSerif-Bold.ttf",
    }
    familles = {
        "normal": ("DejaVu", "DejaVuSans.ttf"),
        "gras": ("DejaVu-Bold", "DejaVuSans-Bold.ttf"),
        "mono": ("DejaVuMono", "DejaVuSansMono.ttf"),
        "mono_gras": ("DejaVuMono-Bold", "DejaVuSansMono-Bold.ttf"),
        "serif": ("DejaVuSerif", "DejaVuSerif.ttf"),
        "serif_gras": ("DejaVuSerif-Bold", "DejaVuSerif-Bold.ttf"),
    }
    for cle, (nom, fichier) in familles.items():
        chemin = DOSSIER_POLICES / fichier
        pdfmetrics.registerFont(TTFont(nom, str(chemin)))
        correspondance[cle] = nom

    pdfmetrics.registerFontFamily(
        "DejaVu",
        normal="DejaVu",
        bold="DejaVu-Bold",
        italic="DejaVu",
        boldItalic="DejaVu-Bold",
    )
    return correspondance


# --------------------------------------------------------------------------
# Styles
# --------------------------------------------------------------------------
CHAPITRES_ENCHAINES = False
TOC_PROFONDEUR = 3
TOC_SUR_PLACE = False


def construire_styles(polices: dict[str, str]) -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    styles: dict[str, ParagraphStyle] = {}

    styles["corps"] = ParagraphStyle(
        "corps",
        parent=base["BodyText"],
        fontName=polices["normal"],
        fontSize=9.2,
        leading=13,
        textColor=GRIS_TEXTE,
        alignment=TA_JUSTIFY,
        spaceAfter=5,
    )
    styles["corps_centre"] = ParagraphStyle(
        "corps_centre", parent=styles["corps"], alignment=TA_CENTER
    )
    styles["titre_document"] = ParagraphStyle(
        "titre_document",
        parent=styles["corps"],
        fontName=polices["gras"],
        fontSize=19,
        leading=24,
        textColor=VERT_PROFOND,
        alignment=TA_CENTER,
        spaceAfter=10,
    )
    styles["sous_titre_document"] = ParagraphStyle(
        "sous_titre_document",
        parent=styles["corps"],
        fontName=polices["serif"],
        fontSize=14,
        leading=19,
        textColor=VERT_INSTITUTIONNEL,
        alignment=TA_CENTER,
        spaceAfter=6,
    )
    styles["mention_document"] = ParagraphStyle(
        "mention_document",
        parent=styles["corps"],
        fontSize=10,
        leading=14,
        textColor=GRIS_SECONDAIRE,
        alignment=TA_CENTER,
    )
    styles["chapitre"] = ParagraphStyle(
        "chapitre",
        parent=styles["corps"],
        fontName=polices["gras"],
        fontSize=15.5,
        leading=20,
        textColor=VERT_PROFOND,
        alignment=TA_LEFT,
        spaceBefore=2,
        spaceAfter=6,
    )
    styles["section"] = ParagraphStyle(
        "section",
        parent=styles["corps"],
        fontName=polices["gras"],
        fontSize=11.8,
        leading=16,
        textColor=VERT_INSTITUTIONNEL,
        spaceBefore=10,
        spaceAfter=4,
    )
    styles["sous_section"] = ParagraphStyle(
        "sous_section",
        parent=styles["corps"],
        fontName=polices["gras"],
        fontSize=10.2,
        leading=14,
        textColor=GRIS_TEXTE,
        spaceBefore=8,
        spaceAfter=3,
    )
    styles["puce"] = ParagraphStyle(
        "puce",
        parent=styles["corps"],
        leftIndent=12,
        bulletIndent=2,
        spaceAfter=2.5,
        alignment=TA_LEFT,
    )
    styles["puce_niveau2"] = ParagraphStyle(
        "puce_niveau2",
        parent=styles["puce"],
        leftIndent=24,
        bulletIndent=14,
        fontSize=8.8,
        leading=12,
    )
    styles["citation"] = ParagraphStyle(
        "citation",
        parent=styles["corps"],
        leftIndent=14,
        rightIndent=8,
        textColor=GRIS_SECONDAIRE,
        fontName=polices["serif"],
    )
    styles["code"] = ParagraphStyle(
        "code",
        parent=styles["corps"],
        fontName=polices["mono"],
        fontSize=7.2,
        leading=9.6,
        textColor=colors.HexColor("#14352A"),
    )
    styles["cellule"] = ParagraphStyle(
        "cellule",
        parent=styles["corps"],
        fontSize=8.1,
        leading=10.6,
        alignment=TA_LEFT,
        spaceAfter=0,
    )
    styles["cellule_entete"] = ParagraphStyle(
        "cellule_entete",
        parent=styles["cellule"],
        fontName=polices["gras"],
        textColor=colors.white,
    )
    styles["titre_toc"] = ParagraphStyle(
        "titre_toc",
        parent=styles["chapitre"],
        fontSize=15.5,
        alignment=TA_LEFT,
    )
    return styles


# --------------------------------------------------------------------------
# Parser Markdown
# --------------------------------------------------------------------------
class Bloc:
    """Bloc de contenu élémentaire issu du Markdown."""

    def __init__(self, genre: str, **donnees):
        self.genre = genre
        self.donnees = donnees

    def __repr__(self) -> str:  # pragma: no cover - aide au débogage
        return f"<Bloc {self.genre} {self.donnees!r}>"


MOTIF_TABLEAU = re.compile(r"^\|.*\|$")
MOTIF_SEPARATEUR = re.compile(r"^\|[\s:|-]+\|$")


def echapper(texte: str) -> str:
    return (
        texte.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


ESPACE_RESERVE = "\ue000"  # marqueur interne, absent des sources


def mettre_en_forme(texte: str, polices: dict[str, str]) -> str:
    """Convertit le balisage en ligne Markdown en balisage ReportLab.

    Les segments de code sont isolés avant l'application du gras et de
    l'italique : sans cela, un caractère `*` présent dans un extrait de code
    (par exemple un motif de chemin) serait interprété comme une mise en forme.
    """
    extraits: list[str] = []

    def isoler(correspondance: re.Match) -> str:
        extraits.append(echapper(correspondance.group(1)))
        return f"{ESPACE_RESERVE}{len(extraits) - 1}{ESPACE_RESERVE}"

    texte = re.sub(r"`([^`]+)`", isoler, texte)
    texte = echapper(texte)
    texte = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", texte)
    texte = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", r"<i>\1</i>", texte)
    texte = re.sub(
        ESPACE_RESERVE + r"(\d+)" + ESPACE_RESERVE,
        lambda m: (
            f'<font name="{polices["mono"]}" size="8.2" '
            f'color="#14352A">{extraits[int(m.group(1))]}</font>'
        ),
        texte,
    )
    return texte


def analyser(markdown: str) -> list[Bloc]:
    """Transforme le Markdown en liste de blocs."""
    blocs: list[Bloc] = []
    lignes = markdown.split("\n")
    index = 0

    while index < len(lignes):
        ligne = lignes[index]
        depouillee = ligne.strip()

        # Ligne vide
        if not depouillee:
            index += 1
            continue

        # Bloc de code
        if depouillee.startswith("```"):
            index += 1
            tampon: list[str] = []
            while index < len(lignes) and not lignes[index].strip().startswith("```"):
                tampon.append(lignes[index])
                index += 1
            index += 1
            blocs.append(Bloc("code", texte="\n".join(tampon)))
            continue

        # Marqueur de table des matières
        if depouillee.startswith("<!-- TOC"):
            blocs.append(Bloc("toc"))
            index += 1
            continue

        # Règle horizontale
        if re.fullmatch(r"-{3,}", depouillee):
            blocs.append(Bloc("regle"))
            index += 1
            continue

        # Titres
        correspondance = re.match(r"^(#{1,4})\s+(.*)$", depouillee)
        if correspondance:
            niveau = len(correspondance.group(1))
            blocs.append(
                Bloc("titre", niveau=niveau, texte=correspondance.group(2).strip())
            )
            index += 1
            continue

        # Tableaux
        if MOTIF_TABLEAU.match(depouillee):
            lignes_tableau: list[str] = []
            while index < len(lignes) and MOTIF_TABLEAU.match(lignes[index].strip()):
                lignes_tableau.append(lignes[index].strip())
                index += 1
            entetes: list[str] = []
            corps: list[list[str]] = []
            for position, brute in enumerate(lignes_tableau):
                cellules = [c.strip() for c in brute.strip("|").split("|")]
                if position == 0:
                    entetes = cellules
                elif MOTIF_SEPARATEUR.match(brute):
                    continue
                else:
                    corps.append(cellules)
            blocs.append(Bloc("tableau", entetes=entetes, corps=corps))
            continue

        # Citations
        if depouillee.startswith(">"):
            tampon = []
            while index < len(lignes) and lignes[index].strip().startswith(">"):
                tampon.append(lignes[index].strip().lstrip(">").strip())
                index += 1
            blocs.append(Bloc("citation", texte=" ".join(tampon)))
            continue

        # Listes à puces
        if re.match(r"^[-*]\s+", depouillee):
            while index < len(lignes) and re.match(
                r"^\s*[-*]\s+", lignes[index]
            ):
                brute = lignes[index]
                indentation = len(brute) - len(brute.lstrip())
                contenu = re.sub(r"^\s*[-*]\s+", "", brute).strip()
                blocs.append(
                    Bloc(
                        "puce",
                        texte=contenu,
                        niveau=2 if indentation >= 2 else 1,
                    )
                )
                index += 1
            continue

        # Listes numérotées
        if re.match(r"^\d+\.\s+", depouillee):
            while index < len(lignes) and re.match(
                r"^\s*\d+\.\s+", lignes[index]
            ):
                contenu = re.sub(r"^\s*\d+\.\s+", "", lignes[index]).strip()
                blocs.append(Bloc("puce_numerotee", texte=contenu))
                index += 1
            continue

        # Paragraphe (fusion des lignes consécutives)
        tampon = [depouillee]
        index += 1
        while index < len(lignes):
            suivi = lignes[index].strip()
            if (
                not suivi
                or suivi.startswith("#")
                or suivi.startswith("```")
                or suivi.startswith(">")
                or suivi.startswith("<!-- TOC")
                or re.match(r"^[-*]\s+", suivi)
                or re.match(r"^\d+\.\s+", suivi)
                or MOTIF_TABLEAU.match(suivi)
                or re.fullmatch(r"-{3,}", suivi)
            ):
                break
            tampon.append(suivi)
            index += 1
        blocs.append(Bloc("paragraphe", texte=" ".join(tampon)))

    return blocs


# --------------------------------------------------------------------------
# Gabarit de document (table des matières + en-têtes de chapitre)
# --------------------------------------------------------------------------
class DocumentCahier(BaseDocTemplate):
    def __init__(self, chemin: str, **options):
        super().__init__(chemin, **options)
        cadre = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            id="cadre",
        )
        self.addPageTemplates(
            [
                PageTemplate(
                    id="standard",
                    frames=[cadre],
                    onPage=dessiner_pied_de_page,
                )
            ]
        )
        self.numeros_chapitres = 0

    def afterFlowable(self, flowable) -> None:  # noqa: N802 (API ReportLab)
        if isinstance(flowable, Paragraph):
            style = flowable.style.name
            if style in {"chapitre", "section", "sous_section"}:
                niveau = {"chapitre": 0, "section": 1, "sous_section": 2}[style]
                if niveau > TOC_PROFONDEUR - 1:
                    return
                texte = flowable.getPlainText()
                if texte.strip().lower() == "sommaire":
                    return
                cle = f"toc-{id(flowable)}"
                self.canv.bookmarkPage(cle)
                self.notify("TOCEntry", (niveau, texte, self.page, cle))


def libelle_ajuste(canevas, libelle: str, largeur_max: float, taille: float) -> str:
    """Réduit le libellé du pied de page pour qu'il n'atteigne pas le numéro de page."""
    if canevas.stringWidth(libelle, "DejaVu", taille) <= largeur_max:
        return libelle
    coupe = libelle
    while coupe and canevas.stringWidth(coupe + "…", "DejaVu", taille) > largeur_max:
        coupe = coupe[:-1]
    return coupe.rstrip(" ,;:-—") + "…"


def dessiner_pied_de_page(canevas, document) -> None:
    """Pied de page et bandeau courant (sauf sur la page de garde)."""
    if canevas.getPageNumber() == 1:
        return
    canevas.saveState()
    canevas.setStrokeColor(GRIS_BORDURE)
    canevas.setLineWidth(0.4)
    canevas.line(
        document.leftMargin,
        document.bottomMargin - 6 * mm,
        document.pagesize[0] - document.rightMargin,
        document.bottomMargin - 6 * mm,
    )
    canevas.setFont("DejaVu", 6.6)
    canevas.setFillColor(GRIS_SECONDAIRE)
    largeur_utile_pied = (
        document.pagesize[0] - document.leftMargin - document.rightMargin - 44
    )
    canevas.drawString(
        document.leftMargin,
        document.bottomMargin - 10.4 * mm,
        libelle_ajuste(canevas, LIBELLE_COURANT, largeur_utile_pied, 6.6),
    )
    canevas.setFont("DejaVu-Bold", 7.6)
    canevas.setFillColor(VERT_PROFOND)
    canevas.drawRightString(
        document.pagesize[0] - document.rightMargin,
        document.bottomMargin - 10.4 * mm,
        f"Page {canevas.getPageNumber()}",
    )
    if canevas.getPageNumber() > 1:
        canevas.setFont("DejaVu", 6.6)
        canevas.setFillColor(GRIS_SECONDAIRE)
        canevas.drawString(document.leftMargin, document.pagesize[1] - 12 * mm, "Université de Fianarantsoa — équipe Projet et Partenariat")
    canevas.restoreState()


# --------------------------------------------------------------------------
# Rendu des blocs
# --------------------------------------------------------------------------
LARGEUR_UTILE = A4[0] - 2 * 18 * mm


def repartir_largeurs(poids, largeur_totale, minimum, iterations=8):
    """Répartit la largeur disponible au prorata des poids.

    Les colonnes dont la part proportionnelle serait inférieure à leur largeur
    minimale sont figées à cette valeur, et la place restante est répartie
    entre les autres colonnes. Si la largeur disponible ne suffit pas pour
    toutes les colonnes, les largeurs sont réduites uniformément.
    """
    if isinstance(minimum, (int, float)):
        minimum = [minimum] * len(poids)

    nombre = len(poids)
    figees = [False] * nombre
    largeurs = [0.0] * nombre

    for _ in range(iterations):
        reste = largeur_totale - sum(
            largeurs[position] for position in range(nombre) if figees[position]
        )
        poids_libres = sum(
            poids[position] for position in range(nombre) if not figees[position]
        )
        if poids_libres <= 0:
            break
        changement = False
        for position in range(nombre):
            if figees[position]:
                continue
            largeurs[position] = reste * poids[position] / poids_libres
            if largeurs[position] < minimum[position]:
                largeurs[position] = minimum[position]
                figees[position] = True
                changement = True
        if not changement:
            return largeurs

    total = sum(largeurs)
    if total > largeur_totale:
        facteur = largeur_totale / total
        largeurs = [largeur * facteur for largeur in largeurs]
    return largeurs


def mesurer_jeton(jeton: str, polices, taille: float) -> float:
    """Largeur d'un mot insécable, estimée avec la police la plus large utilisée."""
    return pdfmetrics.stringWidth(jeton, polices["mono"], taille)


def mots_insecables(texte: str) -> list[str]:
    """Mots d'une cellule, tels que ReportLab devra les placer sans coupure."""
    nettoye = re.sub(r"[`*]", "", texte)
    nettoye = re.sub(r"\s+", " ", nettoye)
    return [mot for mot in re.split(r"[ \t]", nettoye) if mot]


def construire_tableau(bloc: Bloc, styles, polices) -> Table:
    entetes = bloc.donnees["entetes"]
    corps = bloc.donnees["corps"]
    nombre_colonnes = len(entetes)

    taille_cellule = 8.1 if nombre_colonnes <= 4 else 7.2
    style_cellule = ParagraphStyle(
        "cellule_dynamique",
        parent=styles["cellule"],
        fontSize=taille_cellule,
        leading=taille_cellule * 1.3,
    )
    style_entete = ParagraphStyle(
        "entete_dynamique",
        parent=style_cellule,
        fontName=polices["gras"],
        textColor=colors.white,
    )

    # Poids de répartition : volume moyen du contenu de chaque colonne.
    poids = []
    for position in range(nombre_colonnes):
        longueurs = [
            len(ligne[position])
            for ligne in corps
            if position < len(ligne) and ligne[position]
        ] or [1]
        poids.append(max(sum(longueurs) / len(longueurs), 1.15 * len(entetes[position]), 6))

    # Largeur minimale : le mot insécable le plus long de la colonne, plafonné
    # pour qu'une colonne ne puisse pas absorber tout le tableau.
    plafond = LARGEUR_UTILE * (0.42 if nombre_colonnes <= 4 else 0.3)
    minima = []
    for position in range(nombre_colonnes):
        contenus = [entetes[position]] + [
            ligne[position]
            for ligne in corps
            if position < len(ligne) and ligne[position]
        ]
        plus_large = max(
            (mesurer_jeton(mot, polices, taille_cellule) for contenu in contenus for mot in mots_insecables(contenu)),
            default=0.0,
        )
        # La marge couvre les retraits internes de la cellule (4 pt de chaque côté)
        # et l'approximation de mesure, afin qu'aucun mot ne soit coupé.
        minima.append(min(plafond, plus_large + 0.5 * cm))

    largeurs = repartir_largeurs(poids, LARGEUR_UTILE, minima)

    donnees = [
        [Paragraph(mettre_en_forme(cellule, polices), style_entete) for cellule in entetes]
    ]
    for ligne in corps:
        cellules = list(ligne) + [""] * (nombre_colonnes - len(ligne))
        donnees.append(
            [
                Paragraph(mettre_en_forme(cellule, polices), style_cellule)
                for cellule in cellules[:nombre_colonnes]
            ]
        )

    tableau = Table(donnees, colWidths=largeurs, repeatRows=1, hAlign="LEFT")
    tableau.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), VERT_INSTITUTIONNEL),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.35, GRIS_BORDURE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, GRIS_FOND]),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    return tableau


def rendre_blocs(
    blocs: list[Bloc],
    styles,
    polices,
    page_de_garde: list,
) -> tuple[list, list]:
    """Construit les flux ReportLab. Retourne (page de garde, corps)."""
    corps: list = []
    index_titre = None
    # Vrai lorsqu'aucun contenu n'a encore été écrit depuis le dernier saut de page :
    # évite deux sauts de page consécutifs séparés par un simple espacement.
    tete_de_page = True

    for position, bloc in enumerate(blocs):
        if bloc.genre == "titre" and bloc.donnees["niveau"] == 1:
            index_titre = position
            break
    fin_garde = None
    if index_titre is not None:
        for position in range(index_titre, len(blocs)):
            if blocs[position].genre == "regle":
                fin_garde = position
                break

    # Repérage des blocs qui précèdent immédiatement un titre de chapitre : les
    # espacements qui les suivent sont supprimés, car ils créeraient une page
    # blanche avant le saut de page du chapitre.
    avant_chapitre = [False] * len(blocs)
    for position in range(len(blocs)):
        for suivant in range(position + 1, len(blocs)):
            if blocs[suivant].genre == "regle":
                continue
            avant_chapitre[position] = (
                blocs[suivant].genre == "titre" and blocs[suivant].donnees["niveau"] == 1
            )
            break

    for position, bloc in enumerate(blocs):
        # --- Page de garde -------------------------------------------------
        if fin_garde is not None and position <= fin_garde:
            if bloc.genre == "titre" and bloc.donnees["niveau"] == 1:
                page_de_garde.append(Spacer(1, 5.2 * cm))
                page_de_garde.append(
                    HRFlowable(
                        width=LARGEUR_UTILE * 0.5,
                        thickness=2,
                        color=OR_INSTITUTIONNEL,
                        spaceAfter=12,
                        hAlign="CENTER",
                    )
                )
                page_de_garde.append(
                    Paragraph(mettre_en_forme(bloc.donnees["texte"], polices), styles["titre_document"])
                )
            elif bloc.genre == "titre" and bloc.donnees["niveau"] == 2:
                page_de_garde.append(
                    Paragraph(mettre_en_forme(bloc.donnees["texte"], polices), styles["sous_titre_document"])
                )
            elif bloc.genre == "paragraphe":
                page_de_garde.append(
                    Paragraph(mettre_en_forme(bloc.donnees["texte"], polices), styles["mention_document"])
                )
            elif bloc.genre == "tableau":
                page_de_garde.append(Spacer(1, 1.2 * cm))
                tableau = construire_tableau(bloc, styles, polices)
                page_de_garde.append(tableau)
            if position == fin_garde:
                page_de_garde.append(PageBreak())
            continue

        # --- Corps ---------------------------------------------------------
        if bloc.genre == "titre":
            niveau = bloc.donnees["niveau"]
            texte = mettre_en_forme(bloc.donnees["texte"], polices)
            if niveau == 1:
                if not tete_de_page and not CHAPITRES_ENCHAINES:
                    corps.append(PageBreak())
                if CHAPITRES_ENCHAINES and not tete_de_page:
                    # Sans saut de page, un chapitre enchaîné a besoin d'air
                    # au-dessus de son titre pour rester lisible.
                    corps.append(Spacer(1, 14))
                tete_de_page = True
                corps.append(Paragraph(texte, styles["chapitre"]))
                corps.append(
                    HRFlowable(
                        width=LARGEUR_UTILE,
                        thickness=1.1,
                        color=VERT_INSTITUTIONNEL,
                        spaceBefore=1,
                        spaceAfter=8,
                    )
                )
            elif niveau == 2:
                corps.append(Paragraph(texte, styles["section"]))
                tete_de_page = False
            else:
                corps.append(Paragraph(texte, styles["sous_section"]))
                tete_de_page = False
        elif bloc.genre == "paragraphe":
            texte = bloc.donnees["texte"]
            if texte.strip().startswith("**Note de méthode**") or texte.strip().startswith(
                "**Note"
            ):
                corps.append(
                    Table(
                        [
                            [
                                Paragraph(
                                    mettre_en_forme(texte, polices),
                                    ParagraphStyle(
                                        "encadre",
                                        parent=styles["corps"],
                                        fontSize=8.8,
                                        leading=12.4,
                                    ),
                                )
                            ]
                        ],
                        colWidths=[LARGEUR_UTILE],
                        style=TableStyle(
                            [
                                ("BACKGROUND", (0, 0), (-1, -1), GRIS_FOND),
                                ("BOX", (0, 0), (-1, -1), 0.6, VERT_INSTITUTIONNEL),
                                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                                ("TOPPADDING", (0, 0), (-1, -1), 6),
                                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                            ]
                        ),
                    )
                )
            else:
                corps.append(Paragraph(mettre_en_forme(texte, polices), styles["corps"]))
            tete_de_page = False
        elif bloc.genre in {"puce", "puce_numerotee"}:
            tete_de_page = False
            style = styles["puce_niveau2"] if bloc.donnees.get("niveau") == 2 else styles["puce"]
            puce = "•" if bloc.genre == "puce" else "–"
            corps.append(
                Paragraph(
                    mettre_en_forme(bloc.donnees["texte"], polices),
                    style,
                    bulletText=puce,
                )
            )
        elif bloc.genre == "citation":
            tete_de_page = False
            corps.append(
                KeepTogether(
                    [
                        Paragraph(
                            mettre_en_forme(bloc.donnees["texte"], polices),
                            styles["citation"],
                        )
                    ]
                )
            )
        elif bloc.genre == "code":
            tete_de_page = False
            corps.append(
                Table(
                    [
                        [
                            Preformatted(
                                bloc.donnees["texte"], styles["code"], maxLineLength=120
                            )
                        ]
                    ],
                    colWidths=[LARGEUR_UTILE],
                    style=TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, -1), GRIS_FOND),
                            ("BOX", (0, 0), (-1, -1), 0.4, GRIS_BORDURE),
                            ("LEFTPADDING", (0, 0), (-1, -1), 6),
                            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                            ("TOPPADDING", (0, 0), (-1, -1), 5),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                        ]
                    ),
                )
            )
        elif bloc.genre == "tableau":
            corps.append(Spacer(1, 3))
            corps.append(construire_tableau(bloc, styles, polices))
            if not avant_chapitre[position]:
                corps.append(Spacer(1, 7))
            tete_de_page = False
        elif bloc.genre == "regle":
            if not tete_de_page and not avant_chapitre[position]:
                corps.append(Spacer(1, 4))
        elif bloc.genre == "toc":
            table_des_matieres = TableOfContents()
            table_des_matieres.levelStyles = [
                ParagraphStyle(
                    "toc0",
                    fontName=polices["gras"],
                    fontSize=10,
                    leading=15,
                    textColor=VERT_PROFOND,
                    spaceBefore=6,
                    leftIndent=0,
                ),
                ParagraphStyle(
                    "toc1",
                    fontName=polices["normal"],
                    fontSize=9,
                    leading=13,
                    textColor=GRIS_TEXTE,
                    leftIndent=12,
                ),
                ParagraphStyle(
                    "toc2",
                    fontName=polices["normal"],
                    fontSize=8.2,
                    leading=12,
                    textColor=GRIS_SECONDAIRE,
                    leftIndent=26,
                ),
            ]
            deja_titre = bool(
                corps
                and isinstance(corps[-1], Paragraph)
                and corps[-1].getPlainText().strip().lower() == "sommaire"
            )
            # Le titre « Sommaire » éventuellement présent juste avant le marqueur
            # est déplacé sur la page de la table des matières.
            titre_deplace = None
            if (
                corps
                and isinstance(corps[-1], Paragraph)
                and corps[-1].getPlainText().strip().lower() == "sommaire"
            ):
                titre_deplace = corps.pop()
            if corps and not isinstance(corps[-1], PageBreak) and not TOC_SUR_PLACE:
                corps.append(PageBreak())
            if titre_deplace is not None:
                corps.append(titre_deplace)
            if not deja_titre:
                corps.append(Paragraph("Sommaire", styles["titre_toc"]))
                corps.append(
                    HRFlowable(
                        width=LARGEUR_UTILE,
                        thickness=1.1,
                        color=VERT_INSTITUTIONNEL,
                        spaceBefore=1,
                        spaceAfter=8,
                    )
                )
            corps.append(table_des_matieres)
            corps.append(PageBreak())
            tete_de_page = True
    return page_de_garde, corps


def convertir(
    source: Path,
    destination: Path,
    chapitres_enchaines: bool = False,
    toc_profondeur: int = 3,
    toc_sur_place: bool = False,
) -> None:
    global LIBELLE_COURANT, CHAPITRES_ENCHAINES, TOC_PROFONDEUR, TOC_SUR_PLACE
    CHAPITRES_ENCHAINES = chapitres_enchaines
    TOC_PROFONDEUR = max(1, min(3, toc_profondeur))
    TOC_SUR_PLACE = toc_sur_place
    polices = enregistrer_polices()
    styles = construire_styles(polices)
    blocs = analyser(source.read_text(encoding="utf-8"))

    # Libellé du pied de page : reprend le titre et le sous-titre du document
    titre = next(
        (b.donnees["texte"] for b in blocs if b.genre == "titre" and b.donnees["niveau"] == 1),
        "Document",
    )
    sous_titre = next(
        (b.donnees["texte"] for b in blocs if b.genre == "titre" and b.donnees["niveau"] == 2),
        "",
    )
    # Le pied de page retient le sous-titre (qui nomme le document) suivi de
    # l'Université, plutôt que le titre complet : celui-ci dépasse la largeur
    # disponible et se retrouverait tronqué au milieu d'un mot.
    if sous_titre:
        LIBELLE_COURANT = f"{sous_titre} — Université de Fianarantsoa"
    elif len(titre) <= 110:
        LIBELLE_COURANT = titre
    else:
        LIBELLE_COURANT = "Projets et partenariats — Université de Fianarantsoa"

    page_de_garde, corps = rendre_blocs(blocs, styles, polices, [])

    document = DocumentCahier(
        str(destination),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=17 * mm,
        bottomMargin=18 * mm,
        title="Cahier des charges — Plateforme de gestion et de suivi des projets et partenariats",
        author="Université de Fianarantsoa — équipe Projet et Partenariat",
        subject="Cahier des charges version 5",
    )
    document.multiBuild(page_de_garde + corps)


def main() -> int:
    brut = sys.argv[1:]
    arguments: list[str] = []
    options: set[str] = set()
    profondeur = 3
    attend_valeur = False
    for element in brut:
        if attend_valeur:
            if not element.isdigit():
                print(__doc__)
                return 1
            profondeur = int(element)
            attend_valeur = False
            continue
        if element == "--toc-profondeur":
            options.add(element)
            attend_valeur = True
            continue
        if element.startswith("--"):
            options.add(element)
        else:
            arguments.append(element)
    if attend_valeur:
        print(__doc__)
        return 1
    inconnues = options - {"--chapitres-enchaines", "--toc-profondeur", "--toc-sur-place"}
    if len(arguments) != 2 or inconnues:
        print(__doc__)
        return 1
    source = Path(arguments[0])
    destination = Path(arguments[1])
    if not source.exists():
        print(f"Fichier source introuvable : {source}")
        return 1
    destination.parent.mkdir(parents=True, exist_ok=True)
    convertir(
        source,
        destination,
        chapitres_enchaines="--chapitres-enchaines" in options,
        toc_profondeur=profondeur if "--toc-profondeur" in options else 3,
        toc_sur_place="--toc-sur-place" in options,
    )
    print(f"PDF généré : {destination}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
