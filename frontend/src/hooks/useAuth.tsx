// src/hooks/useAuth.ts
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import apiClient from "@/lib/api-client"
import type { Utilisateur } from "@/types/api"

interface AuthContextValue {
  utilisateur: Utilisateur | null
  estCharge: boolean
  connecter: (utilisateur: Utilisateur) => void
  deconnecter: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  const [estCharge, setEstCharge] = useState(true)

  useEffect(() => {
    apiClient
      .get<Utilisateur>("/auth/me")
      .then((reponse) => setUtilisateur(reponse.data))
      .catch(() => setUtilisateur(null))
      .finally(() => setEstCharge(false))
  }, [])

  const connecter = (nouvelUtilisateur: Utilisateur) => setUtilisateur(nouvelUtilisateur)

  const deconnecter = () => {
    apiClient.post("/auth/logout").finally(() => setUtilisateur(null))
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