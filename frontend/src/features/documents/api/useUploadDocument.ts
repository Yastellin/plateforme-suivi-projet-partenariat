// src/features/documents/api/useUploadDocument.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useUploadDocument(onProgress?: (progress: number) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const reponse = await apiClient.post("/documents/upload", formData, {
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress?.(percentCompleted)
        },
      })
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })
}