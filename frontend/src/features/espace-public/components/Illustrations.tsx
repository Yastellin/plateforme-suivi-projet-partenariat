// src/features/espace-public/components/Illustrations.tsx
// Illustrations decoratives de la vitrine (maquette) : formes geometriques, sans donnees.

export type TypeIllustration = "montagne" | "reseau" | "cotutelle"

export function Illustration({ type }: { type: TypeIllustration }) {
  if (type === "reseau") {
    return (
      <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="500" height="400" fill="#E6EEF6" />
        <g stroke="#27435F" strokeWidth="2" opacity=".35">
          <path d="M250 90 120 210M250 90 380 210M120 210 250 310M380 210 250 310M120 210 380 210M250 90 250 310" />
        </g>
        <g fill="#27435F">
          <circle cx="250" cy="90" r="16" />
          <circle cx="120" cy="210" r="13" />
          <circle cx="380" cy="210" r="13" />
          <circle cx="250" cy="310" r="16" />
        </g>
        <circle cx="250" cy="90" r="30" fill="none" stroke="#27435F" opacity=".25" />
        <circle cx="250" cy="90" r="48" fill="none" stroke="#27435F" opacity=".15" />
        <circle cx="250" cy="200" r="9" fill="#C89000" />
      </svg>
    )
  }
  if (type === "cotutelle") {
    return (
      <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="500" height="400" fill="#FBF0D6" />
        <g fill="none" stroke="#6B4B00" strokeWidth="2" opacity=".5">
          <circle cx="190" cy="200" r="90" />
          <circle cx="310" cy="200" r="90" />
        </g>
        <path d="M250 124a90 90 0 0 1 0 152 90 90 0 0 1 0-152z" fill="#367D56" opacity=".85" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="500" height="400" fill="#E8F0EA" />
      <circle cx="380" cy="86" r="34" fill="#C89000" opacity=".9" />
      <path d="M0 250 Q120 170 250 220 T500 190 V400 H0Z" fill="#9CC3AA" />
      <path d="M0 290 Q130 220 260 265 T500 240 V400 H0Z" fill="#6BA583" />
      <path d="M0 330 Q140 275 270 310 T500 290 V400 H0Z" fill="#367D56" />
      <path d="M0 365 Q150 325 280 350 T500 335 V400 H0Z" fill="#1B4D34" />
    </svg>
  )
}
