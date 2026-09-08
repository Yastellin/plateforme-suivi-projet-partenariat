// src/lib/api-client.ts
import axios, { type AxiosError } from "axios"
import type { ReponseApi } from "@/types/api"

// Le token JWT est stocke en cookie httpOnly pose par le backend (section 11
// du prompt) : rien a injecter manuellement dans les headers ici, le
// navigateur envoie le cookie automatiquement grace a withCredentials.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
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
    if (erreur.response?.status === 401) {
      window.location.assign("/connexion")
    }
    const message = erreur.response?.data?.message ?? erreur.message
    return Promise.reject(new Error(message))
  }
)

export default apiClient