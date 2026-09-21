// src/router.tsx
import { lazy, Suspense, useState, useEffect } from "react"
import { createBrowserRouter, Navigate, RouterProvider, Outlet } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuth } from "@/hooks/useAuth"
import type { RoleUtilisateur } from "@/types/api"
import { SidebarInterne } from "@/components/layout/SidebarInterne"
import { TopbarPublique } from "@/components/layout/TopbarPublique"
import { TopbarInterne } from "@/components/layout/TopbarInterne"
import { NotificationsDrawer } from "@/components/layout/NotificationsDrawer"
import { CommandPalette } from "@/components/layout/CommandPalette"
import { ForbiddenPage } from "@/components/shared/ForbiddenPage"
import { NotFoundPage } from "@/components/shared/NotFoundPage"
import { PageTransition } from "@/components/shared/PageTransition"
import { Skeleton } from "@/components/ui/skeleton"

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })))
const TableauDeBordPresidence = lazy(() => import("@/features/tableau-de-bord/pages/TableauDeBordPresidence").then((m) => ({ default: m.TableauDeBordPresidence })))
const TableauDeBordEtablissement = lazy(() => import("@/features/tableau-de-bord/pages/TableauDeBordEtablissement").then((m) => ({ default: m.TableauDeBordEtablissement })))
const TableauDeBordDecideur = lazy(() => import("@/features/tableau-de-bord/pages/TableauDeBordDecideur").then((m) => ({ default: m.TableauDeBordDecideur })))
const PartenairesListePage = lazy(() => import("@/features/partenaires/pages/PartenairesListePage").then((m) => ({ default: m.PartenairesListePage })))
const PartenaireDetailPage = lazy(() => import("@/features/partenaires/pages/PartenaireDetailPage").then((m) => ({ default: m.PartenaireDetailPage })))
const ConventionsListePage = lazy(() => import("@/features/conventions/pages/ConventionsListePage").then((m) => ({ default: m.ConventionsListePage })))
const ConventionDetailPage = lazy(() => import("@/features/conventions/pages/ConventionDetailPage").then((m) => ({ default: m.ConventionDetailPage })))
const ProjetsListePage = lazy(() => import("@/features/projets/pages/ProjetsListePage").then((m) => ({ default: m.ProjetsListePage })))
const ProjetDetailPage = lazy(() => import("@/features/projets/pages/ProjetDetailPage").then((m) => ({ default: m.ProjetDetailPage })))
const CotutellesListePage = lazy(() => import("@/features/cotutelles/pages/CotutellesListePage").then((m) => ({ default: m.CotutellesListePage })))
const CotutelleDetailPage = lazy(() => import("@/features/cotutelles/pages/CotutelleDetailPage").then((m) => ({ default: m.CotutelleDetailPage })))
const PublicationEditPage = lazy(() => import("@/features/publications/pages/PublicationEditPage").then((m) => ({ default: m.PublicationEditPage })))
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage })))
const ArchivesPage = lazy(() => import("./features/archives/pages/ArchivesPage").then((m) => ({ default: m.ArchivesPage })))
const ReferentielsPage = lazy(() => import("@/features/referentiels/pages/ReferentielsPage").then((m) => ({ default: m.ReferentielsPage })))
const EtablissementsListePage = lazy(() => import("@/features/etablissements/pages/EtablissementsListePage").then((m) => ({ default: m.EtablissementsListePage })))
const EtablissementDetailPage = lazy(() => import("@/features/etablissements/pages/EtablissementDetailPage").then((m) => ({ default: m.EtablissementDetailPage })))
const ParametresCompte = lazy(() => import("@/features/comptes/pages/ParametresCompte").then((m) => ({ default: m.ParametresCompte })))
const AccueilPage = lazy(() => import("@/features/espace-public/pages/AccueilPage").then((m) => ({ default: m.AccueilPage })))
const AProposPage = lazy(() => import("@/features/espace-public/pages/AProposPage").then((m) => ({ default: m.AProposPage })))
const EtablissementsPage = lazy(() => import("@/features/espace-public/pages/EtablissementsPage").then((m) => ({ default: m.EtablissementsPage })))
const PartenairesPubliquePage = lazy(() => import("@/features/espace-public/pages/PartenairesPubliquePage").then((m) => ({ default: m.PartenairesPubliquePage })))
const ProjetsPartenariatsPubliquePage = lazy(() => import("@/features/espace-public/pages/ProjetsPartenariatsPubliquePage").then((m) => ({ default: m.ProjetsPartenariatsPubliquePage })))
const PublicationDetailPage = lazy(() => import("@/features/espace-public/pages/PublicationDetailPage").then((m) => ({ default: m.PublicationDetailPage })))
const ContactPage = lazy(() => import("@/features/espace-public/pages/ContactPage").then((m) => ({ default: m.ContactPage })))
const RecherchePage = lazy(() => import("@/features/recherche/pages/RecherchePage").then((m) => ({ default: m.RecherchePage })))
const SynthesePage = lazy(() => import("@/features/synthese/pages/SynthesePage").then((m) => ({ default: m.SynthesePage })))
const DocumentsListePage = lazy(() => import("@/features/documents/pages/DocumentsListePage").then((m) => ({ default: m.DocumentsListePage })))
const PublicationsListePage = lazy(() => import("@/features/publications/pages/PublicationsListePage").then((m) => ({ default: m.PublicationsListePage })))
const PartenariatsListePage = lazy(() => import("@/features/partenariats/pages/PartenariatsListePage").then((m) => ({ default: m.PartenariatsListePage })))
const PartenariatDetailPage = lazy(() => import("@/features/partenariats/pages/PartenariatDetailPage").then((m) => ({ default: m.PartenariatDetailPage })))
const DocumentDetailPage = lazy(() => import("@/features/documents/pages/DocumentDetailPage").then((m) => ({ default: m.DocumentDetailPage })))
const DocumentUploadPage = lazy(() => import("@/features/documents/pages/DocumentUploadPage").then((m) => ({ default: m.DocumentUploadPage })))
const ExportPage = lazy(() => import("@/features/export/pages/ExportPage").then((m) => ({ default: m.ExportPage })))

function ChargementRoute() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

function Charge({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ChargementRoute />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  )
}

export function cheminTableauDeBord(role: RoleUtilisateur): string {
  switch (role) {
    case "PRESIDENCE":
      return "/presidence"
    case "ETABLISSEMENT":
      return "/etablissement"
    case "DECIDEUR":
      return "/decideur"
  }
}

function RedirectionAccueil() {
  const { utilisateur, estCharge } = useAuth()
  if (estCharge) return null
  // Les utilisateurs non connectes voient la page d'accueil publique.
  // Seuls les utilisateurs connectes sont rediriges vers leur tableau de bord.
  if (!utilisateur) return <AccueilPage />
  return <Navigate to={cheminTableauDeBord(utilisateur.role)} replace />
}

function RouteProtegee({
  rolesAutorises,
  children,
}: {
  rolesAutorises: RoleUtilisateur[]
  children: ReactNode
}) {
  const { utilisateur, estCharge } = useAuth()

  if (estCharge) return null
  if (!utilisateur) return <Navigate to="/connexion" replace />
  if (!rolesAutorises.includes(utilisateur.role)) return <ForbiddenPage />

  return <>{children}</>
}

// Mise en page de l'espace public (section 6.2) : barre de navigation
// horizontale fixe + pied de page.
function LayoutPublic() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopbarPublique />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-muted/50 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} Université de Fianarantsoa — Plateforme de suivi des projets et partenariats
          </p>
        </div>
      </footer>
    </div>
  )
}

// Mise en page commune a tout l'espace interne (section 6.1) :
// sidebar retractable + topbar avec Cmd+K.
function LayoutInterne() {
  const [drawerNotifs, setDrawerNotifs] = useState(false)
  const [paletteOuverte, setPaletteOuverte] = useState(false)

  useEffect(() => {
    function gererTouche(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setPaletteOuverte((v) => !v)
      }
    }
    document.addEventListener("keydown", gererTouche)
    return () => document.removeEventListener("keydown", gererTouche)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarInterne />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopbarInterne onOuvrirRecherche={() => setPaletteOuverte(true)} onOuvrirNotifications={() => setDrawerNotifs(true)} />
        <main className="flex-1 overflow-y-auto p-[28px_32px_52px]">
          <Outlet />
        </main>
      </div>
      <NotificationsDrawer ouvert={drawerNotifs} onFermer={() => setDrawerNotifs(false)} />
      <CommandPalette ouvert={paletteOuverte} onFermer={() => setPaletteOuverte(false)} />
    </div>
  )
}


const router = createBrowserRouter([
  {
    element: <LayoutPublic />,
    children: [
      { path: "/", element: <Charge><RedirectionAccueil /></Charge> },
      { path: "/a-propos", element: <Charge><AProposPage /></Charge> },
      { path: "/etablissements", element: <Charge><EtablissementsPage /></Charge> },
      { path: "/partenaires", element: <Charge><PartenairesPubliquePage /></Charge> },
      { path: "/projets-partenariats", element: <Charge><ProjetsPartenariatsPubliquePage /></Charge> },
      { path: "/projets-partenariats/publication/:id", element: <Charge><PublicationDetailPage /></Charge> },
      { path: "/contact", element: <Charge><ContactPage /></Charge> },
    ],
  },
  { path: "/connexion", element: <Charge><LoginPage /></Charge> },
  {
    element: <LayoutInterne />,
    children: [
      { path: "/presidence", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><TableauDeBordPresidence /></Charge></RouteProtegee> },
      { path: "/presidence/conventions", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ConventionsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/conventions/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ConventionDetailPage /></Charge></RouteProtegee> },
      { path: "/presidence/referentiels", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ReferentielsPage /></Charge></RouteProtegee> },
      { path: "/presidence/etablissements", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><EtablissementsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/etablissements/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><EtablissementDetailPage /></Charge></RouteProtegee> },
      { path: "/presidence/archives", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ArchivesPage /></Charge></RouteProtegee> },
      { path: "/presidence/export", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ExportPage /></Charge></RouteProtegee> },
      { path: "/presidence/recherche", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><RecherchePage /></Charge></RouteProtegee> },
      { path: "/presidence/synthese", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><SynthesePage /></Charge></RouteProtegee> },
      { path: "/presidence/documents", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><DocumentsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/documents/nouveau", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><DocumentUploadPage /></Charge></RouteProtegee> },
      { path: "/presidence/documents/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><DocumentDetailPage /></Charge></RouteProtegee> },
      { path: "/presidence/publications", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PublicationsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/notifications", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><NotificationsPage /></Charge></RouteProtegee> },
      { path: "/etablissement/notifications", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><NotificationsPage /></Charge></RouteProtegee> },
      { path: "/presidence/projets", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ProjetsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/publications/:projetId", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PublicationEditPage /></Charge></RouteProtegee> },
      { path: "/presidence/projets/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ProjetDetailPage /></Charge></RouteProtegee> },
      { path: "/etablissement/projets", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><ProjetsListePage /></Charge></RouteProtegee> },
      { path: "/etablissement/projets/:id", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><ProjetDetailPage /></Charge></RouteProtegee> },
      { path: "/presidence/parametres", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ParametresCompte /></Charge></RouteProtegee> },
      { path: "/presidence/cotutelles", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><CotutellesListePage /></Charge></RouteProtegee> },
      { path: "/presidence/cotutelles/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><CotutelleDetailPage /></Charge></RouteProtegee> },
      { path: "/etablissement/parametres", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><ParametresCompte /></Charge></RouteProtegee> },
      { path: "/decideur/parametres", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><ParametresCompte /></Charge></RouteProtegee> },
      { path: "/etablissement", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><TableauDeBordEtablissement /></Charge></RouteProtegee> },
      { path: "/decideur", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><TableauDeBordDecideur /></Charge></RouteProtegee> },
      { path: "/etablissement/cotutelles", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><CotutellesListePage /></Charge></RouteProtegee> },
      { path: "/etablissement/cotutelles/:id", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><CotutelleDetailPage /></Charge></RouteProtegee> },
      { path: "/decideur/projets", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><ProjetsListePage /></Charge></RouteProtegee> },
      { path: "/decideur/projets/:id", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><ProjetDetailPage /></Charge></RouteProtegee> },
      { path: "/decideur/conventions", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><ConventionsListePage /></Charge></RouteProtegee> },
      { path: "/decideur/conventions/:id", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><ConventionDetailPage /></Charge></RouteProtegee> },
      { path: "/decideur/cotutelles", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><CotutellesListePage /></Charge></RouteProtegee> },
      { path: "/decideur/cotutelles/:id", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><CotutelleDetailPage /></Charge></RouteProtegee> },
      { path: "/decideur/documents", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><DocumentsListePage /></Charge></RouteProtegee> },
      { path: "/decideur/documents/:id", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><DocumentDetailPage /></Charge></RouteProtegee> },
      { path: "/decideur/etablissements", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><EtablissementsListePage /></Charge></RouteProtegee> },
      { path: "/decideur/etablissements/:id", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><EtablissementDetailPage /></Charge></RouteProtegee> },

      { path: "/presidence/partenaires-partenariats/partenaires", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PartenairesListePage /></Charge></RouteProtegee> },
      { path: "/presidence/partenaires-partenariats/partenaires/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PartenaireDetailPage /></Charge></RouteProtegee> },
      { path: "/etablissement/partenaires-partenariats/partenaires", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><PartenairesListePage /></Charge></RouteProtegee> },
      { path: "/etablissement/partenaires-partenariats/partenaires/:id", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><PartenaireDetailPage /></Charge></RouteProtegee> },
      { path: "/decideur/partenaires-partenariats/partenaires", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><PartenairesListePage /></Charge></RouteProtegee> },
      { path: "/decideur/partenaires-partenariats/partenaires/:id", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><PartenaireDetailPage /></Charge></RouteProtegee> },
      { path: "/decideur/partenaires-partenariats/partenariats", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><PartenariatsListePage /></Charge></RouteProtegee> },
      { path: "/decideur/partenaires-partenariats/partenariats/:id", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><PartenariatDetailPage /></Charge></RouteProtegee> },
      { path: "/presidence/partenaires-partenariats/partenariats", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PartenariatsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/partenaires-partenariats/partenariats/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PartenariatDetailPage /></Charge></RouteProtegee> },
      { path: "/etablissement/partenaires-partenariats/partenariats", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><PartenariatsListePage /></Charge></RouteProtegee> },
      { path: "/etablissement/partenaires-partenariats/partenariats/:id", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><PartenariatDetailPage /></Charge></RouteProtegee> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}