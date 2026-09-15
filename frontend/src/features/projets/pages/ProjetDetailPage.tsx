// src/features/projets/pages/ProjetDetailPage.tsx
import { useParams } from "react-router-dom"
import { useState } from "react"
import { useProjet } from "@/features/projets/api/useProjet"
import { Button } from "@/components/ui/button"

export function ProjetDetailPage() {
  const { id } = useParams<{ id: string }>()
  
  const [editing, setEditing] = useState(false)

  const { data: projet, isLoading } = useProjet(id)

  if (!id || isLoading) {
    return <div className="p-6">Chargement du projet...</div>
  }

  if (!projet) {
    return <div className="p-6">Projet non trouvé</div>
  }

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-semibold mb-4">{projet.nom}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Nom</p>
          <p className="font-medium">{projet.nom}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Description</p>
          <p className="text-medium">{projet.description || "Non spécifiée"}</p>
        </div>
      </div>

      {editing ? (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setEditing(false)}>
            Annuler
          </Button>
          <Button type="submit">Enregistrer les modifications</Button>
        </div>
      ) : (
        <Button onClick={() => setEditing(true)}>Modifier</Button>
      )}
    </div>
  )
}