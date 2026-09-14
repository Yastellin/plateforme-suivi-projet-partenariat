// src/hooks/useAuth.tsx
import { createContext, useContext, useState, type ReactNode } from "react"
import { definirAccessToken } from "@/lib/api-client"
import type { Utilisateur } from "@/types/api"

interface AuthContextValue {
  utilisateur: Utilisateur | null
  estCharge: boolean
  connecter: (utilisateur: Utilisateur, accessToken: string) => void
  deconnecter: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  // Pas de cookie httpOnly a verifier au demarrage : sans persistance,
  // il n'y a pas de session a restaurer, on considere le chargement termine
  // immediatement (a ameliorer plus tard avec un vrai flux de refresh token
  // stocke de facon securisee).
  const [estCharge] = useState(false)

  const connecter = (nouvelUtilisateur: Utilisateur, accessToken: string) => {
    definirAccessToken(accessToken)
    setUtilisateur(nouvelUtilisateur)
  }

  const deconnecter = () => {
    definirAccessToken(null)
    setUtilisateur(null)
  }

  return (
    <AuthContext.Provider value={{ utilisateur, estCharge, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexte = useContext(AuthContext)
  if (!contexte) {
    throw new Error("useAuth doit etre utilise a l'interieur de AuthProvider")
  }
  return contexte
}