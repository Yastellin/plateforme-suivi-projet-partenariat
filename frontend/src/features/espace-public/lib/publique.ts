// src/features/espace-public/lib/publique.ts
import type { StatutProjet } from "@/types/api"
import { formaterDate } from "@/lib/format"

// Decoupe une liste en groupes de taille fixe (une diapositive = un groupe).
export function decouper<T>(items: T[], taille: number): T[][] {
  const groupes: T[][] = []
  for (let i = 0; i < items.length; i += taille) {
    groupes.push(items.slice(i, i + taille))
  }
  return groupes
}

const LIBELLES_STATUT_PROJET: Record<StatutProjet, string> = {
  BROUILLON: "Brouillon",
  EN_ATTENTE: "En attente",
  EN_COURS: "En cours",
  SUSPENDU: "Suspendu",
  EXPIRE: "Expiré",
  TERMINE: "Terminé",
}

export function libelleStatutProjet(statut: StatutProjet): string {
  return LIBELLES_STATUT_PROJET[statut] ?? statut
}

// Ton visuel du badge de statut (couleurs du theme).
export function tonStatutProjet(statut: StatutProjet): string {
  switch (statut) {
    case "EN_COURS":
      return "bg-primary/10 text-primary"
    case "TERMINE":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    case "SUSPENDU":
    case "EXPIRE":
      return "bg-destructive/10 text-destructive"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function formaterPeriode(debut: string, fin: string): string {
  return `${formaterDate(debut)} → ${formaterDate(fin)}`
}

export function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? "")
    .join("")
}

// Texte de repli lorsque la description n'est pas renseignee : il decrit
// l'element a partir des donnees disponibles, sans promesse inventee.
export function resumeProjet(projet: {
  description: string | null
  statut: StatutProjet
  domaine: string | null
  etablissement: { nom: string } | null
}): string {
  if (projet.description) return projet.description
  const statut = libelleStatutProjet(projet.statut).toLowerCase()
  const domaine = projet.domaine ? ` dans le domaine ${projet.domaine.toLowerCase()}` : ""
  const porteur = projet.etablissement ? ` porté par ${projet.etablissement.nom}` : " porté par la Présidence"
  return `Projet ${statut}${domaine}${porteur}.`
}

export function resumePartenaire(partenaire: { description: string | null; pays: string }): string {
  if (partenaire.description) return partenaire.description
  return `Partenaire de l'Université, présent en ${partenaire.pays}.`
}

export function imagePrincipalePublication(publication: {
  image_couverture_url?: string | null
  photos?: { url_fichier: string; ordre?: number }[]
}): string | null {
  if (publication.image_couverture_url) return publication.image_couverture_url
  const premierePhoto = [...(publication.photos ?? [])].sort(
    (premiere, seconde) => (premiere.ordre ?? 0) - (seconde.ordre ?? 0),
  )[0]
  return premierePhoto?.url_fichier ?? null
}

export function resumePublication(publication: {
  description_publique: string | null
  projet: { nom: string }
}): string {
  if (publication.description_publique) return publication.description_publique
  return `Actualité issue du projet « ${publication.projet.nom} ».`
}

const TEINTES_VIGNETTE = ["#367D56", "#27435F", "#8A5A00", "#7A2E3A", "#4A5A2B", "#1B4D34"]

// Couleur stable par nom, pour les vignettes sans logo.
export function teinteDe(nom: string): string {
  let somme = 0
  for (const caractere of nom) somme += caractere.charCodeAt(0)
  return TEINTES_VIGNETTE[somme % TEINTES_VIGNETTE.length]
}
