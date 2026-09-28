// src/router.tsx
<<<<<<< Updated upstream
=======

import { lazy, Suspense, useState, useEffect } from "react"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
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
=======
import { PageTransition } from "@/components/shared/PageTransition"
import { Skeleton } from "@/components/ui/skeleton"

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })))
const TableauDeBordPresidence = lazy(() => import("@/features/tableau-de-bord/pages/TableauDeBordPresidence").then((m) => ({ default: m.TableauDeBordPresidence })))
const TableauDeBordEtablissement = lazy(() => import("@/features/tableau-de-bord/pages/TableauDeBordEtablissement").then((m) => ({ default: m.TableauDeBordEtablissement })))
const TableauDeBordDecideur = lazy(() => import("@/features/tableau-de-bord/pages/TableauDeBordDecideur").then((m) => ({ default: m.TableauDeBordDecideur })))
const PartenairesListePage = lazy(() => import("@/features/partenaires/pages/PartenairesListePage").then((m) => ({ default: m.PartenairesListePage })))
const PartenaireCreatePage = lazy(() => import("@/features/partenaires/pages/PartenaireCreatePage").then((m) => ({ default: m.PartenaireCreatePage })))
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
const PartenariatCreatePage = lazy(() => import("@/features/partenariats/pages/PartenariatCreatePage").then((m) => ({ default: m.PartenariatCreatePage })))
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
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
// Mise en page commune a tout l'espace interne (section 6.1) :
// sidebar retractable + fil d'Ariane + bascule theme.
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
=======
      { path: "/presidence/partenaires-partenariats/partenaires", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PartenairesListePage /></Charge></RouteProtegee> },
      { path: "/presidence/partenaires-partenariats/partenaires/nouveau", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PartenaireCreatePage /></Charge></RouteProtegee> },
      { path: "/presidence/partenaires-partenariats/partenaires/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PartenaireDetailPage /></Charge></RouteProtegee> },
      { path: "/etablissement/partenaires-partenariats/partenaires", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><PartenairesListePage /></Charge></RouteProtegee> },
      { path: "/etablissement/partenaires-partenariats/partenaires/nouveau", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><PartenaireCreatePage /></Charge></RouteProtegee> },
      { path: "/etablissement/partenaires-partenariats/partenaires/:id", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><PartenaireDetailPage /></Charge></RouteProtegee> },
      { path: "/decideur/partenaires-partenariats/partenaires", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><PartenairesListePage /></Charge></RouteProtegee> },
      { path: "/decideur/partenaires-partenariats/partenaires/:id", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><PartenaireDetailPage /></Charge></RouteProtegee> },
      { path: "/decideur/partenaires-partenariats/partenariats", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><PartenariatsListePage /></Charge></RouteProtegee> },
      { path: "/decideur/partenaires-partenariats/partenariats/:id", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><PartenariatDetailPage /></Charge></RouteProtegee> },
      { path: "/presidence/partenaires-partenariats/partenariats", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PartenariatsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/partenaires-partenariats/partenariats/nouveau", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PartenariatCreatePage /></Charge></RouteProtegee> },
      { path: "/presidence/partenaires-partenariats/partenariats/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PartenariatDetailPage /></Charge></RouteProtegee> },
      { path: "/etablissement/partenaires-partenariats/partenariats", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><PartenariatsListePage /></Charge></RouteProtegee> },
      { path: "/etablissement/partenaires-partenariats/partenariats/nouveau", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><PartenariatCreatePage /></Charge></RouteProtegee> },
      { path: "/etablissement/partenaires-partenariats/partenariats/:id", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><PartenariatDetailPage /></Charge></RouteProtegee> },
>>>>>>> Stashed changes
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}