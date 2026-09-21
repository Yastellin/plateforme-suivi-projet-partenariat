// src/components/layout/NotificationsDrawer.tsx
import { X, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/features/notifications/api/useNotifications"
import { useMarquerToutLu } from "@/features/notifications/api/useMarquerLue"
import { NotificationItem } from "@/features/notifications/components/NotificationItem"

interface NotificationsDrawerProps {
  ouvert: boolean
  onFermer: () => void
}

export function NotificationsDrawer({ ouvert, onFermer }: NotificationsDrawerProps) {
  const { data: notifications } = useNotifications({})
  const { mutate: marquerToutLu } = useMarquerToutLu()

  return (
    <>
      {ouvert && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={onFermer}
        />
      )}

      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-[400px] flex-col border-l border-border bg-surface shadow-md transition-transform duration-200",
          ouvert ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-[16px] font-semibold">Notifications</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => marquerToutLu()}
              className="h-8 text-[12px]"
            >
              <CheckCheck size={14} className="mr-1" />
              Tout marquer lu
            </Button>
            <button
              onClick={onFermer}
              className="rounded-[var(--radius-sm)] p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications && notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[13px] text-muted-foreground">Aucune notification</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
