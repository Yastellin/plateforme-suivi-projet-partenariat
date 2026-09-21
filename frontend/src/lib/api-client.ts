// src/lib/api-client.ts
import axios, { type AxiosError } from "axios"
import type { ReponseApi } from "@/types/api"
import { tokenStorage } from "./token-storage"

const API_BASE_URL = import.meta.env.VITE_API_URL
let accessToken: string | null = null

export function definirAccessToken(token: string | null) {
  accessToken = token
}

const apiClient = axios.create({ baseURL: API_BASE_URL })

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

apiClient.interceptors.response.use(
  (reponse) => {
    const enveloppe = reponse.data as ReponseApi<unknown>
    if (enveloppe.status === "error") {
      return Promise.reject(new Error(enveloppe.message))
    }
    return { ...reponse, data: enveloppe.data }
  },
  async (erreur: AxiosError<ReponseApi<unknown>>) => {
    const originalRequest = erreur.config as any

    if (erreur.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = tokenStorage.getRefreshToken()

      if (refreshToken && !originalRequest.url?.includes("/auth/refresh")) {
        originalRequest._retry = true

        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
            .then((res) => {
              const data = res.data.data as { access_token: string }
              definirAccessToken(data.access_token)
              refreshPromise = null
              return data.access_token
            })
            .catch(() => {
              refreshPromise = null
              tokenStorage.clearRefreshToken()
              definirAccessToken(null)
              window.location.assign("/connexion")
              throw new Error("Session expiree")
            })
        }

        const newToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      }

      definirAccessToken(null)
      tokenStorage.clearRefreshToken()
      if (window.location.pathname !== "/connexion") {
        window.location.assign("/connexion")
      }
    }

    const message = erreur.response?.data?.message ?? erreur.message
    return Promise.reject(new Error(message))
  },
)

export default apiClient