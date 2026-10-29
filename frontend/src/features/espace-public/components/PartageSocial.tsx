import { useState } from "react"
import { Check, Copy, Link2, Share2 } from "lucide-react"

interface PartageSocialProps {
  titre?: string
}

// Actions de partage avec URL natives, sans dépendance à un service tiers.
export function PartageSocial({ titre = "Partager cette page" }: PartageSocialProps) {
  const [copie, setCopie] = useState(false)
  const url = typeof window === "undefined" ? "" : window.location.href
  const texte = typeof window === "undefined" ? "" : document.title
  const urlEncodee = encodeURIComponent(url)
  const texteEncode = encodeURIComponent(texte)

  async function copierLien() {
    try {
      await navigator.clipboard.writeText(url)
      setCopie(true)
      window.setTimeout(() => setCopie(false), 2000)
    } catch {
      setCopie(false)
    }
  }

  return (
    <section className="vt-partage-social" aria-label={titre}>
      <span>{titre}</span>
      <div className="vt-partage-social-actions">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${urlEncodee}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Partager sur Facebook"
        >
          <Share2 size={17} aria-hidden="true" />
          <span>Facebook</span>
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${urlEncodee}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Partager sur LinkedIn"
        >
          <Link2 size={17} aria-hidden="true" />
          <span>LinkedIn</span>
        </a>
        <a
          href={`mailto:?subject=${texteEncode}&body=${urlEncodee}`}
          aria-label="Partager par courriel"
        >
          <Share2 size={17} aria-hidden="true" />
          <span>Courriel</span>
        </a>
        <button type="button" onClick={copierLien} aria-label="Copier le lien de cette page">
          {copie ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
          <span>{copie ? "Lien copié" : "Copier"}</span>
        </button>
      </div>
    </section>
  )
}
