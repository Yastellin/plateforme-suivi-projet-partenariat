// src/router.tsx
import { createBrowserRouter, Navigate, RouterProvider, Outlet } from "react-router-dom"
import type { ReactNode } from "react"

import { useAuth } from "@/hooks/useAuth"
import type { RoleUtilisateur } from "@/types/api"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { TableauDeBordPresidence } from "@/features/tableau-de-bord/pages/TableauDeBordPresidence"
import { TableauDeBordEtablissement } from "@/features/tableau-de-bord/pages/TableauDeBordEtablissement"
import { TableauDeBordDecideur } from "@/features/tableau-de-bord/pages/TableauDeBordDecideur"
import { PartenairesListePage } from "@/features/partenaires/pages/PartenairesListePage"
import { PartenaireDetailPage } from "@/features/partenaires/pages/PartenaireDetailPage"
import { ForbiddenPage } from "@/components/shared/ForbiddenPage"
import { NotFoundPage } from "@/components/shared/NotFoundPage"
import { SidebarInterne } from "@/components/layout/SidebarInterne"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { ParametresCompte } from "@/features/comptes/pages/ParametresCompte"
import { CotutellesListePage } from "@/features/cotutelles/pages/CotutellesListePage"
import { CotutelleDetailPage } from "@/features/cotutelles/pages/CotutelleDetailPage"
import { ConventionDetailPage } from "@/features/conventions/pages/ConventionDetailPage"
import { ConventionsListePage } from "@/features/conventions/pages/ConventionsListePage"
import { ProjetsListePage } from "@/features/projets/pages/ProjetsListePage"
import { ProjetDetailPage } from "@/features/projets/pages/ProjetDetailPage"
import { PublicationEditPage } from "@/features/publications/pages/PublicationEditPage"
import { NotificationsPage } from "@/features/notifications/pages/NotificationsPage"
import { ArchivesPage } from "./features/archives/pages/ArchivesPage"
import { TopbarPublique } from "@/components/layout/TopbarPublique"
import { AccueilPage } from "@/features/espace-public/pages/AccueilPage"
import { AProposPage } from "@/features/espace-public/pages/AProposPage"
import { EtablissementsPage } from "@/features/espace-public/pages/EtablissementsPage"
import { PartenairesPubliquePage } from "@/features/espace-public/pages/PartenairesPubliquePage"
import { ProjetsPartenariatsPubliquePage } from "@/features/espace-public/pages/ProjetsPartenariatsPubliquePage"
import { PublicationDetailPage } from "@/features/espace-public/pages/PublicationDetailPage"
import { ContactPage } from "@/features/espace-public/pages/ContactPage"

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
// sidebar retractable + fil d'Ariane + bascule theme.
function LayoutInterne() {
  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarInterne />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <Breadcrumbs />
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}


const router = createBrowserRouter([
  {
    element: <LayoutPublic />,
    children: [
      { path: "/", element: <RedirectionAccueil /> },
      { path: "/a-propos", element: <AProposPage /> },
      { path: "/etablissements", element: <EtablissementsPage /> },
      { path: "/partenaires", element: <PartenairesPubliquePage /> },
      { path: "/projets-partenariats", element: <ProjetsPartenariatsPubliquePage /> },
      { path: "/projets-partenariats/publication/:id", element: <PublicationDetailPage /> },
      { path: "/contact", element: <ContactPage /> },
    ],
  },
  { path: "/connexion", element: <LoginPage /> },
  {
    element: <LayoutInterne />,
    children: [
      {
        path: "/presidence",
        element: (
          <RouteProtegee rolesAutorises={["PRESIDENCE"]}>
            <TableauDeBordPresidence />
          </RouteProtegee>
        ),
      },
      {
        path: "/presidence/conventions",
        element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><ConventionsListePage /></RouteProtegee>,
      },
      {
        path: "/presidence/conventions/:id",
        element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><ConventionDetailPage /></RouteProtegee>,
      },
      {
      path: "/presidence/archives",
      element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><ArchivesPage /></RouteProtegee>,
      },
      {
        path: "/presidence/notifications",
        element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><NotificationsPage /></RouteProtegee>,
      },
      {
        path: "/etablissement/notifications",
        element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><NotificationsPage /></RouteProtegee>,
      },
      {
        path: "/presidence/projets",
        element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><ProjetsListePage /></RouteProtegee>,
      },
      {
        path: "/presidence/publications/:projetId",
        element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><PublicationEditPage /></RouteProtegee>,
      },
      {
        path: "/presidence/projets/:id",
        element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><ProjetDetailPage /></RouteProtegee>,
      },
      {
        path: "/etablissement/projets",
        element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><ProjetsListePage /></RouteProtegee>,
      },
      {
        path: "/etablissement/projets/:id",
        element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><ProjetDetailPage /></RouteProtegee>,
      },
      {
        path: "/presidence/parametres",
        element: (
          <RouteProtegee rolesAutorises={["PRESIDENCE"]}>
            <ParametresCompte />
          </RouteProtegee>
        ),
      },
      {
        path: "/presidence/cotutelles",
        element: (
          <RouteProtegee rolesAutorises={["PRESIDENCE"]}>
            <CotutellesListePage />
          </RouteProtegee>
        ),
      },
      {
        path: "/presidence/cotutelles/:id",
        element: (
          <RouteProtegee rolesAutorises={["PRESIDENCE"]}>
            <CotutelleDetailPage />
          </RouteProtegee>
        ),
  },
      {
        path: "/etablissement/parametres",
        element: (
          <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}>
            <ParametresCompte />
          </RouteProtegee>
        ),
      },
      {
        path: "/decideur/parametres",
        element: (
          <RouteProtegee rolesAutorises={["DECIDEUR"]}>
            <ParametresCompte />
          </RouteProtegee>
        ),
      },
      {
        path: "/etablissement",
        element: (
          <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}>
            <TableauDeBordEtablissement />
          </RouteProtegee>
        ),
      },
      {
        path: "/decideur",
        element: (
          <RouteProtegee rolesAutorises={["DECIDEUR"]}>
            <TableauDeBordDecideur />
          </RouteProtegee>
        ),
      },

      // Partenaires - meme pages pour les 3 roles : le backend filtre deja
      // les donnees par etablissement cote serveur (RG05, RG07).
      {
        path: "/presidence/partenaires-partenariats/partenaires",
        element: (
          <RouteProtegee rolesAutorises={["PRESIDENCE"]}>
            <PartenairesListePage />
          </RouteProtegee>
        ),
      },
      {
        path: "/presidence/partenaires-partenariats/partenaires/:id",
        element: (
          <RouteProtegee rolesAutorises={["PRESIDENCE"]}>
            <PartenaireDetailPage />
          </RouteProtegee>
        ),
      },
      {
        path: "/etablissement/partenaires-partenariats/partenaires",
        element: (
          <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}>
            <PartenairesListePage />
          </RouteProtegee>
        ),
      },
      {
        path: "/etablissement/partenaires-partenariats/partenaires/:id",
        element: (
          <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}>
            <PartenaireDetailPage />
          </RouteProtegee>
        ),
      },
      {
        path: "/decideur/partenaires-partenariats/partenaires",
        element: (
          <RouteProtegee rolesAutorises={["DECIDEUR"]}>
            <PartenairesListePage />
          </RouteProtegee>
        ),
      },
      {
        path: "/decideur/partenaires-partenariats/partenaires/:id",
        element: (
          <RouteProtegee rolesAutorises={["DECIDEUR"]}>
            <PartenaireDetailPage />
          </RouteProtegee>
        ),
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}