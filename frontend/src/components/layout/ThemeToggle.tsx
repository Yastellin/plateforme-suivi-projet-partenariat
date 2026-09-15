// src/components/layout/ThemeToggle.tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"

export function ThemeToggle() {
  const { theme, basculerTheme } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={basculerTheme}
      aria-label="Basculer le theme"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </Button>
  )
}