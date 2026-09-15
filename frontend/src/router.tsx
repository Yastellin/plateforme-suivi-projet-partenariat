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
  if (!utilisateur) return <Navigate to="/connexion" replace />
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
  { path: "/", element: <RedirectionAccueil /> },
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