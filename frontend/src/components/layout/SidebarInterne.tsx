// src/components/layout/SidebarInterne.tsx
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import type { RoleUtilisateur } from "@/types/api"
import {
  Handshake,
  Users,
  FolderKanban,
  FileText,
  Newspaper,
  Archive,
  BarChart3,
  Bell,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

interface LienMenu {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number }>
}

interface GroupeMenu {
  label: string
  icon: React.ComponentType<{ size?: number }>
  liens: LienMenu[]
}

// Menu par role, conforme section 6.1 du prompt : la Presidence voit tout,
// l'Etablissement uniquement son perimetre restreint (section 5).
function menuPourRole(role: RoleUtilisateur): GroupeMenu[] {
  if (role === "PRESIDENCE") {
    return [
      { label: "Partenaires & partenariats", icon: Handshake, liens: [
        { label: "Partenaires", href: "/presidence/partenaires-partenariats/partenaires", icon: Handshake },
      ]},
      { label: "Cotutelles", icon: Users, liens: [
        { label: "Liste des cotutelles", href: "/presidence/cotutelles", icon: Users },
      ]},
      { label: "Projets", icon: FolderKanban, liens: [
        { label: "Liste", href: "/presidence/projets", icon: FolderKanban },
        { label: "Activites", href: "/presidence/projets/activites", icon: FolderKanban },
        { label: "Chronogramme", href: "/presidence/projets/chronogramme", icon: FolderKanban },
      ]},
      { label: "Conventions", icon: FileText, liens: [
        { label: "Liste", href: "/presidence/conventions", icon: FileText },
        { label: "Circuit de traitement", href: "/presidence/conventions/circuit", icon: FileText },
      ]},
      { label: "Documents", icon: FileText, liens: [
        { label: "Tous les documents", href: "/presidence/documents", icon: FileText },
      ]},
      { label: "Publications", icon: Newspaper, liens: [
        { label: "Gerer les publications", href: "/presidence/publications", icon: Newspaper },
      ]},
      { label: "Archives", icon: Archive, liens: [
        { label: "Consulter les archives", href: "/presidence/archives", icon: Archive },
      ]},
      { label: "Synthese annuelle", icon: BarChart3, liens: [
        { label: "Synthese par etablissement", href: "/presidence/synthese", icon: BarChart3 },
      ]},
      { label: "Notifications", icon: Bell, liens: [
        { label: "Toutes les notifications", href: "/presidence/notifications", icon: Bell },
      ]},
      { label: "Parametres", icon: Settings, liens: [
        { label: "Mon compte", href: "/presidence/parametres", icon: Settings },
      ]},
    ]
  }

  if (role === "ETABLISSEMENT") {
    return [
      { label: "Mes partenaires & partenariats", icon: Handshake, liens: [
        { label: "Partenaires", href: "/etablissement/partenaires-partenariats/partenaires", icon: Handshake },
      ]},
      { label: "Mes projets", icon: FolderKanban, liens: [
        { label: "Liste", href: "/etablissement/projets", icon: FolderKanban },
      ]},
      { label: "Notifications", icon: Bell, liens: [
        { label: "Toutes les notifications", href: "/etablissement/notifications", icon: Bell },
      ]},
      { label: "Parametres", icon: Settings, liens: [
        { label: "Mon compte", href: "/etablissement/parametres", icon: Settings },
      ]},
    ]
  }

  // DECIDEUR : consultation seule (RG32). Le prompt (section 6.1) ne detaille
  // pas ce menu explicitement ; perimetre deduit de la section 12
  // (repartition des fonctionnalites) : pas de Notifications, pas de gestion.
  return [
    { label: "Partenaires & partenariats", icon: Handshake, liens: [
      { label: "Partenaires", href: "/decideur/partenaires-partenariats/partenaires", icon: Handshake },
    ]},
    { label: "Projets", icon: FolderKanban, liens: [
      { label: "Consultation", href: "/decideur/projets", icon: FolderKanban },
    ]},
    { label: "Conventions", icon: FileText, liens: [
      { label: "Consultation", href: "/decideur/conventions", icon: FileText },
    ]},
    { label: "Parametres", icon: Settings, liens: [
      { label: "Mon compte", href: "/decideur/parametres", icon: Settings },
    ]},
  ]
}

export function SidebarInterne() {
  const [reduite, setReduite] = useState(false)
  const { utilisateur } = useAuth()
  const { pathname } = useLocation()

  if (!utilisateur) {
    return null
  }

  const groupes = menuPourRole(utilisateur.role)

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-200",
        reduite ? "w-16" : "w-72"
      )}
    >
      <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-3">
        {!reduite && (
          <span className="font-heading text-sm font-semibold text-sidebar-foreground">
            Suivi Partenariats
          </span>
        )}
        <Button variant="ghost" size="icon" onClick={() => setReduite((r) => !r)}>
          {reduite ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {reduite ? (
          <div className="flex flex-col items-center gap-3">
            {groupes.map((groupe) => (
              <Link
                key={groupe.label}
                to={groupe.liens[0].href}
                title={groupe.label}
                className="rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <groupe.icon size={20} />
              </Link>
            ))}
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {groupes.map((groupe) => (
              <AccordionItem key={groupe.label} value={groupe.label} className="border-b-0">
                <AccordionTrigger className="px-2 py-2 text-sm hover:no-underline">
                  <span className="flex items-center gap-2 text-sidebar-foreground">
                    <groupe.icon size={16} />
                    {groupe.label}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-7">
                  <div className="flex flex-col gap-0.5">
                    {groupe.liens.map((lien) => {
                      const actif = pathname === lien.href
                      return (
                        <Link
                          key={lien.href}
                          to={lien.href}
                          className={cn(
                            "rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            actif && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          )}
                        >
                          {lien.label}
                        </Link>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </aside>
  )
}