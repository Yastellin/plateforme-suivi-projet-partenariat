// src/features/auth/pages/LoginPage.tsx

import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { cheminTableauDeBord } from "@/router"
import { LayoutAuthentification } from "@/features/auth/components/LayoutAuthentification"
import { LoginForm } from "../components/LoginForm"

export function LoginPage() {
  const { utilisateur, estCharge } = useAuth()

  if (estCharge) {
    return null
  }

  if (utilisateur) {
    return <Navigate to={cheminTableauDeBord(utilisateur.role)} replace />
  }

  return (
    <LayoutAuthentification
      titre="Connexion"
      description="Connectez-vous avec votre compte institutionnel."
    >
      <LoginForm />
    </LayoutAuthentification>
  )
}
