// src/hooks/useAuth.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import apiClient, { definirAccessToken } from "@/lib/api-client"
import { tokenStorage } from "@/lib/token-storage"
import type { Utilisateur } from "@/types/api"

interface AuthContextValue {
  utilisateur: Utilisateur | null
  estCharge: boolean
  connecter: (utilisateur: Utilisateur, accessToken: string, refreshToken: string) => void
  deconnecter: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)
  const [estCharge, setEstCharge] = useState(true)

  useEffect(() => {
    async function restaurerSession() {
      const refreshToken = tokenStorage.getRefreshToken()
      if (!refreshToken) {
        setEstCharge(false)
        return
      }

      try {
        const res = await apiClient.post<{ access_token: string }>("/auth/refresh", {
          refresh_token: refreshToken,
        })
        definirAccessToken(res.data.access_token)

        const me = await apiClient.get<Utilisateur>("/auth/me")
        setUtilisateur(me.data)
      } catch {
        tokenStorage.clearRefreshToken()
      } finally {
        setEstCharge(false)
      }
    }
    restaurerSession()
  }, [])

  function connecter(user: Utilisateur, accessToken: string, refreshToken: string) {
    definirAccessToken(accessToken)
    tokenStorage.setRefreshToken(refreshToken)
    setUtilisateur(user)
  }

  function deconnecter() {
    definirAccessToken(null)
    tokenStorage.clearRefreshToken()
    setUtilisateur(null)
    window.location.assign("/connexion")
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