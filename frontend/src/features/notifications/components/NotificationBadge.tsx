// src/features/notifications/components/NotificationBadge.tsx
import { Bell } from "lucide-react"
import { useNotificationsPolling } from "@/features/notifications/api/useNotificationsPolling"

export function NotificationBadge() {
  const { data: notifications } = useNotificationsPolling()
  const nonLues = notifications?.length ?? 0

  return (
    <div className="relative">
      <Bell size={18} />
      {nonLues > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
          {nonLues > 9 ? "9+" : nonLues}
        </span>
      )}
    </div>
  )
}