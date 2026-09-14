// src/hooks/useTheme.ts
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark"
const CLE_STOCKAGE = "theme-plateforme-partenariat"

interface ThemeContextValue {
  theme: Theme
  basculerTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function themeInitial(): Theme {
  const stocke = localStorage.getItem(CLE_STOCKAGE)
  return stocke === "dark" ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(themeInitial)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem(CLE_STOCKAGE, theme)
  }, [theme])

  const basculerTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"))

  return (
    <ThemeContext.Provider value={{ theme, basculerTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const contexte = useContext(ThemeContext)
  if (!contexte) {
    throw new Error("useTheme doit etre utilise a l'interieur de ThemeProvider")
  }
  return contexte
}