import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { ConventionForm } from "@/features/conventions/components/ConventionForm"

export function ConventionCreatePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        titre="Nouvelle convention"
        description="Renseignez les informations et, si nécessaire, ajoutez un document."
      />
      <Panel>
        <PanelBody className="p-5 sm:p-6">
          <ConventionForm
            onSucces={() => navigate("/presidence/conventions")}
            onAnnuler={() => navigate("/presidence/conventions")}
          />
        </PanelBody>
      </Panel>
    </div>
  )
}
