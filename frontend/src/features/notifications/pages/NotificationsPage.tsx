// src/features/notifications/pages/NotificationsPage.tsx
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { NotificationItem } from "@/features/notifications/components/NotificationItem"
import { useNotifications } from "@/features/notifications/api/useNotifications"
import { useMarquerToutLu } from "@/features/notifications/api/useMarquerLue"

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications()
  const marquerToutLu = useMarquerToutLu()

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Notifications</h1>
        {notifications && notifications.some((n) => !n.est_lue) && (
          <Button variant="outline" onClick={() => marquerToutLu.mutate()}>
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : !notifications || notifications.length === 0 ? (
        <EmptyState icon={Bell} titre="Aucune notification" message="Vous etes a jour, rien de nouveau pour l'instant." />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-md border border-border">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  )
}