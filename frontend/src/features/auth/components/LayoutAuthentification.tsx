// src/features/auth/components/LayoutAuthentification.tsx

import type { ReactNode } from "react"

/**
 * Image de fond du panneau gauche de la page de connexion.
 * Pour la changer : placer le fichier dans frontend/public/images/ et modifier ce chemin.
 * Si le fichier n'existe pas, le panneau affiche uniquement le dégradé vert.
 */
export const IMAGE_FOND_CONNEXION = "/images/logo-50-ans.jpeg"

interface LayoutAuthentificationProps {
  titre: string
  description: string
  children: ReactNode
}

function Embleme() {
  return (
    <div
      className="grid h-11 w-11 place-items-center rounded-xl border border-white/25 bg-white/10 text-base font-extrabold text-white backdrop-blur-sm"
      style={{ fontFamily: "var(--font-heading)" }}
      aria-hidden="true"
    >
      UF
    </div>
  )
}

export function LayoutAuthentification({ titre, description, children }: LayoutAuthentificationProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#f4f7f5] lg:grid-cols-[1.08fr_1fr]">
      <aside className="relative hidden overflow-hidden lg:block lg:rounded-r-[44px]">
        <div
          className="absolute inset-0 bg-[#0b4a36] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${IMAGE_FOND_CONNEXION}")` }}
          role="img"
          aria-label="Image de fond de l'Université de Fianarantsoa"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(8,74,56,0.86) 0%, rgba(7,66,50,0.80) 55%, rgba(5,52,40,0.90) 100%)",
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3.5">
            <Embleme />
            <div>
              <strong className="block text-[15px] font-semibold text-white">Université de Fianarantsoa</strong>
              <span className="text-[13px] text-white/75">Projets &amp; Partenariats</span>
            </div>
          </div>

          <div className="max-w-[460px]">
            <h1
              className="text-[38px] font-bold leading-[1.15] tracking-tight text-white xl:text-[44px]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Suivi des projets et partenariats institutionnels
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-white/80">
              Une plateforme unique pour consulter et gérer les collaborations de l'Université.
            </p>
            <span className="mt-8 block h-1 w-14 rounded-full bg-[#34d399]" aria-hidden="true" />
          </div>

          <p className="text-[12px] text-white/55">© Université de Fianarantsoa</p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-[460px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div
              className="grid h-10 w-10 place-items-center rounded-xl bg-[#047857] text-sm font-extrabold text-white"
              style={{ fontFamily: "var(--font-heading)" }}
              aria-hidden="true"
            >
              UF
            </div>
            <div>
              <strong className="block text-[14px] font-semibold text-[#0f2f23]">Université de Fianarantsoa</strong>
              <span className="block text-[12px] text-[#5b6b64]">Projets &amp; Partenariats</span>
            </div>
          </div>

          <div className="rounded-[20px] bg-white p-8 shadow-[0_24px_60px_-28px_rgba(6,64,46,0.35)] ring-1 ring-black/[0.04] sm:p-10">
            <div className="mb-7">
              <h2
                className="text-[28px] font-bold tracking-tight text-[#0b4a36]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {titre}
              </h2>
              <p className="mt-2 text-[14.5px] text-[#5b6b64]">{description}</p>
            </div>

            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
