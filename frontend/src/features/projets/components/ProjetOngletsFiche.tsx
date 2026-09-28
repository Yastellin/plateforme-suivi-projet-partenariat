// src/features/projets/components/ProjetOngletsFiche.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjetForm } from "@/features/projets/components/ProjetForm"
import { DocumentDropzone } from "@/features/documents/components/DocumentDropzone"
import { DocumentVersionsListe } from "@/features/documents/components/DocumentVersionsListe"
import type { Projet } from "@/types/api"

export function ProjetOngletsFiche({ projet, onModifie }: { projet: Projet; onModifie: (p: Projet) => void }) {
  return (
    <Tabs defaultValue="informations">
      <TabsList>
        <TabsTrigger value="informations">Informations</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      <TabsContent value="informations" className="mt-4">
        <ProjetForm projet={projet} onSucces={onModifie} onAnnuler={() => {}} />
      </TabsContent>

      <TabsContent value="documents" className="mt-4 flex flex-col gap-4">
        <DocumentDropzone projetId={projet.id} />
        <div>
          <h3 className="mb-2 font-heading text-sm font-semibold">Documents existants</h3>
          <DocumentVersionsListe documentId={projet.id} />
        </div>
      </TabsContent>
    </Tabs>
  )
}