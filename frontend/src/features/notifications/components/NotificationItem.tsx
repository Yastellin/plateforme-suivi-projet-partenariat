// src/features/notifications/components/NotificationItem.tsx
import { cn } from "@/lib/utils"
import { useMarquerLue } from "@/features/notifications/api/useMarquerLue"
import type { Notification, PrioriteNotification } from "@/types/api"

const COULEUR_PRIORITE: Record<PrioriteNotification, string> = {
  BASSE: "border-l-muted-foreground",
  MOYENNE: "border-l-amber-500",
  HAUTE: "border-l-destructive",
}

export function NotificationItem({ notification }: { notification: Notification }) {
  const marquerLue = useMarquerLue()

  return (
    <button
      onClick={() => !notification.est_lue && marquerLue.mutate(notification.id)}
      className={cn(
        "flex w-full flex-col gap-0.5 border-l-4 p-3 text-left transition-colors",
        COULEUR_PRIORITE[notification.priorite],
        notification.est_lue ? "bg-transparent" : "bg-accent"
      )}
    >
      <p className={cn("text-sm", !notification.est_lue && "font-medium")}>{notification.titre}</p>
      <p className="text-xs text-muted-foreground">{notification.message}</p>
      <p className="font-mono text-xs text-muted-foreground">
        {new Date(notification.date_creation).toLocaleString("fr-FR")}
      </p>
    </button>
  )
}