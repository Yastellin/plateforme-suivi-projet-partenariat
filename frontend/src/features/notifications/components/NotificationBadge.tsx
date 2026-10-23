import { useNombreNotificationsNonLues } from "@/features/notifications/api/useNombreNotificationsNonLues"
import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  className?: string
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const { data: nombre = 0 } = useNombreNotificationsNonLues()

  if (nombre <= 0) {
    return null
  }

  return (
    <span
      aria-label={`${nombre} notification${nombre > 1 ? "s" : ""} non lue${nombre > 1 ? "s" : ""}`}
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-none text-white",
        className,
      )}
    >
      {nombre}
    </span>
  )
}
