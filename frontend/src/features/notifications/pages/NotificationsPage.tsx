// src/features/notifications/pages/NotificationsPage.tsx

import { Bell } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { NotificationItem } from "@/features/notifications/components/NotificationItem"
import { useNotifications } from "@/features/notifications/api/useNotifications"
import { useMarquerToutLu } from "@/features/notifications/api/useMarquerLue"
import { Skeleton } from "@/components/ui/skeleton"

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications()
  const marquerToutLu = useMarquerToutLu()
  const listeNotifications = Array.isArray(notifications) ? notifications : []

  return (
    <div>
      <PageHeader
        titre="Notifications"
        description="Vos notifications récentes."
        actions={
          listeNotifications.some((n) => !n.est_lue) ? (
            <button
              type="button"
              onClick={() => marquerToutLu.mutate()}
              className="rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            >
              Tout marquer comme lu
            </button>
          ) : null
        }
      />

      <Panel>
        <PanelBody>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((cle) => (
                <Skeleton key={cle} className="h-16 w-full" />
              ))}
            </div>
          ) : listeNotifications.length === 0 ? (
            <EmptyState
              icone={Bell}
              titre="Aucune notification"
              description="Vous êtes à jour, rien de nouveau pour l'instant."
            />
          ) : (
            <div className="flex flex-col divide-y divide-[var(--color-border)]">
              {listeNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}
