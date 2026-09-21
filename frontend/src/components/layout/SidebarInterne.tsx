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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
  BookOpen,
  Building2,
  Search,
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
      ]},
      { label: "Conventions", icon: FileText, liens: [
        { label: "Liste", href: "/presidence/conventions", icon: FileText },
      ]},
      { label: "Documents", icon: FileText, liens: [
        { label: "Tous les documents", href: "/presidence/documents", icon: FileText },
      ]},
      { label: "Publications", icon: Newspaper, liens: [
        { label: "Gerer les publications", href: "/presidence/publications", icon: Newspaper },
      ]},
      { label: "Referentiels", icon: BookOpen, liens: [
        { label: "Gerer les referentiels", href: "/presidence/referentiels", icon: BookOpen },
      ]},
      { label: "Etablissements", icon: Building2, liens: [
        { label: "Liste", href: "/presidence/etablissements", icon: Building2 },
      ]},
      { label: "Archives", icon: Archive, liens: [
        { label: "Consulter les archives", href: "/presidence/archives", icon: Archive },
      ]},
      { label: "Recherche", icon: Search, liens: [
        { label: "Recherche globale", href: "/presidence/recherche", icon: Search },
      ]},
      { label: "Synthese annuelle", icon: BarChart3, liens: [
        { label: "Synthese par etablissement", href: "/presidence/synthese", icon: BarChart3 },
      ]},
      { label: "Export", icon: Search, liens: [
        { label: "Exporter les donnees", href: "/presidence/export", icon: Search },
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
        { label: "Partenariats", href: "/etablissement/partenaires-partenariats/partenariats", icon: Handshake },
      ]},
      { label: "Mes projets", icon: FolderKanban, liens: [
        { label: "Liste", href: "/etablissement/projets", icon: FolderKanban },
      ]},
      { label: "Cotutelles", icon: Users, liens: [
        { label: "Liste", href: "/etablissement/cotutelles", icon: Users },
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
    { label: "Partenaires", icon: Handshake, liens: [
      { label: "Partenaires", href: "/decideur/partenaires-partenariats/partenaires", icon: Handshake },
    ]},
    { label: "Projets", icon: FolderKanban, liens: [
      { label: "Consultation", href: "/decideur/projets", icon: FolderKanban },
    ]},
    { label: "Conventions", icon: FileText, liens: [
      { label: "Consultation", href: "/decideur/conventions", icon: FileText },
    ]},
    { label: "Cotutelles", icon: Users, liens: [
      { label: "Consultation", href: "/decideur/cotutelles", icon: Users },
    ]},
    { label: "Documents", icon: FileText, liens: [
      { label: "Consultation", href: "/decideur/documents", icon: FileText },
    ]},
    { label: "Etablissements", icon: Building2, liens: [
      { label: "Consultation", href: "/decideur/etablissements", icon: Building2 },
    ]},
    { label: "Parametres", icon: Settings, liens: [
      { label: "Mon compte", href: "/decideur/parametres", icon: Settings },
    ]},
  ]
}

function ContenuSidebar({ reduite, onFermer }: { reduite: boolean; onFermer?: () => void }) {
  const { utilisateur } = useAuth()
  const { pathname } = useLocation()

  if (!utilisateur) return null
  const groupes = menuPourRole(utilisateur.role)

  return (
    <>
      <div className="flex items-center justify-between border-b border-sidebar-border px-3 py-3">
        {!reduite && <span className="font-heading text-sm font-semibold text-sidebar-foreground">Suivi Partenariats</span>}
        <div className="flex items-center">
          {onFermer && (
            <Button variant="ghost" size="icon" onClick={onFermer} className="mr-1 lg:hidden">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => {}} className="hidden lg:flex">
            {reduite ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {reduite ? (
          <div className="flex flex-col items-center gap-3">
            {groupes.map((groupe) => (
              <Link key={groupe.label} to={groupe.liens[0].href} title={groupe.label} onClick={onFermer}
                className="rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-accent"><groupe.icon size={20} /></Link>
            ))}
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {groupes.map((groupe) => (
              <AccordionItem key={groupe.label} value={groupe.label} className="border-b-0">
                <AccordionTrigger className="px-2 py-2 text-sm hover:no-underline">
                  <span className="flex items-center gap-2 text-sidebar-foreground"><groupe.icon size={16} />{groupe.label}</span>
                </AccordionTrigger>
                <AccordionContent className="pl-7">
                  <div className="flex flex-col gap-0.5">
                    {groupe.liens.map((lien) => {
                      const actif = pathname === lien.href
                      return (
                        <Link key={lien.href} to={lien.href} onClick={onFermer}
                          className={cn("rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", actif && "bg-sidebar-accent font-medium text-sidebar-accent-foreground")}>
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
    </>
  )
}

export function SidebarInterne() {
  const [reduite] = useState(false)
  const { utilisateur } = useAuth()
  if (!utilisateur) return null

  return (
    <>
      <aside className={cn("hidden h-screen flex-col border-r border-border bg-sidebar transition-all duration-200 lg:flex", reduite ? "w-16" : "w-72")}>
        <ContenuSidebar reduite={reduite} />
      </aside>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-3 top-3 z-40 lg:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <ContenuSidebar reduite={false} onFermer={() => {}} />
        </SheetContent>
      </Sheet>
    </>
  )
}