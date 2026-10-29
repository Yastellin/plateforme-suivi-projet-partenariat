// src/features/messages-contact/components/MessagesNonLusBadge.tsx
import { useNombreMessagesNonLus } from "@/features/messages-contact/api/useMessagesContact"
import { cn } from "@/lib/utils"

interface MessagesNonLusBadgeProps {
  className?: string
}

// Pastille du nombre de messages de contact non lus (affichee dans le menu).
export function MessagesNonLusBadge({ className }: MessagesNonLusBadgeProps) {
  const { data: nombre = 0 } = useNombreMessagesNonLus()

  if (nombre <= 0) {
    return null
  }

  return (
    <span
      aria-label={`${nombre} message${nombre > 1 ? "s" : ""} de contact non lu${nombre > 1 ? "s" : ""}`}
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-none text-white",
        className,
      )}
    >
      {nombre}
    </span>
  )
}
