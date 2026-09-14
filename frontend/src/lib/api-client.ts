// src/lib/api-client.ts
import axios, { type AxiosError } from "axios"
import type { ReponseApi } from "@/types/api"

// Le backend utilise un schema Bearer token (pas de cookie httpOnly) :
// le token est garde en memoire ici et injecte manuellement sur chaque
// requete via l'intercepteur de requete ci-dessous.
let accessToken: string | null = null

export function definirAccessToken(token: string | null) {
  accessToken = token
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (reponse) => {
    const enveloppe = reponse.data as ReponseApi<unknown>
    if (enveloppe.status === "error") {
      return Promise.reject(new Error(enveloppe.message))
    }
    return { ...reponse, data: enveloppe.data }
  },
  (erreur: AxiosError<ReponseApi<unknown>>) => {
    const estVerificationSession = erreur.config?.url?.includes("/auth/me")
    const estDejaSurConnexion = window.location.pathname === "/connexion"

    if (erreur.response?.status === 401 && !estVerificationSession && !estDejaSurConnexion) {
      definirAccessToken(null)
      window.location.assign("/connexion")
    }

    const message = erreur.response?.data?.message ?? erreur.message
    return Promise.reject(new Error(message))
  }
)

export default apiClient