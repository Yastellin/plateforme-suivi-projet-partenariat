// src/features/notifications/lib/message-contact.ts

export const TYPE_REFERENCE_MESSAGE_CONTACT = "MessageContact"

export interface ChampMessageContact {
  libelle: string
  valeur: string
}

export interface ContenuMessageContact {
  champs: ChampMessageContact[]
  expediteur: { nom: string; email: string | null }
  corps: string
}

const LIBELLES_CONNUS = ["Référence", "Expéditeur", "Téléphone", "Sujet"]

// Lit le texte d'une notification « nouveau message de contact » :
// lignes « Libellé : valeur », une ligne vide, puis le corps du message.
// Renvoie null si le texte n'a pas cette forme (ancien format, autre notification).
export function analyserMessageContact(texte: string): ContenuMessageContact | null {
  const separateur = texte.indexOf("\n\n")
  if (separateur === -1) return null

  const entete = texte.slice(0, separateur).split("\n")
  const corps = texte.slice(separateur + 2).trim()

  const champs: ChampMessageContact[] = []
  for (const ligne of entete) {
    const indice = ligne.indexOf(" : ")
    if (indice === -1) return null
    const libelle = ligne.slice(0, indice).trim()
    if (!LIBELLES_CONNUS.includes(libelle)) return null
    champs.push({ libelle, valeur: ligne.slice(indice + 3).trim() })
  }
  if (champs.length === 0) return null

  const expediteurBrut = champs.find((c) => c.libelle === "Expéditeur")?.valeur ?? ""
  const correspondance = expediteurBrut.match(/^(.*?)\s*\(([^()]+@[^()]+)\)$/)
  const expediteur = correspondance
    ? { nom: correspondance[1], email: correspondance[2] }
    : { nom: expediteurBrut, email: null }

  return { champs, expediteur, corps }
}
