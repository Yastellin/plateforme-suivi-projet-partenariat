// src/features/projets/components/ProjetOngletsFiche.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjetForm } from "@/features/projets/components/ProjetForm"
import { ActiviteListe } from "@/features/projets/activites/components/ActiviteListe"
import { ActiviteForm } from "@/features/projets/activites/components/ActiviteForm"
import { useAuth } from "@/hooks/useAuth"
import type { Projet } from "@/types/api"

export function ProjetOngletsFiche({ projet, onModifie }: { projet: Projet; onModifie: (p: Projet) => void }) {
  const { utilisateur } = useAuth()
  const estPresidence = utilisateur?.role === "PRESIDENCE"

  return (
    <Tabs defaultValue="informations">
      <TabsList>
        <TabsTrigger value="informations">Informations</TabsTrigger>
        {/* Section 5 : activites/chronogramme/convention/documents reserves a la Presidence */}
        {estPresidence && <TabsTrigger value="activites">Activites</TabsTrigger>}
      </TabsList>

      <TabsContent value="informations" className="mt-4">
        <ProjetForm projet={projet} onSucces={onModifie} onAnnuler={() => {}} />
      </TabsContent>

      {estPresidence && (
        <TabsContent value="activites" className="mt-4 flex flex-col gap-4">
          <ActiviteForm projetId={projet.id} />
          <ActiviteListe projetId={projet.id} />
        </TabsContent>
      )}
    </Tabs>
  )
}