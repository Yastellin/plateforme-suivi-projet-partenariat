// src/router.tsx

import { lazy, Suspense, useState, useEffect } from "react"
import { createBrowserRouter, Navigate, RouterProvider, Outlet, useLocation } from "react-router-dom"
import type { ReactNode } from "react"
import { X } from "lucide-react"
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion"

import { useAuth } from "@/hooks/useAuth"
import type { RoleUtilisateur } from "@/types/api"
import { SidebarInterne } from "@/components/layout/SidebarInterne"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"
import { TopbarPublique } from "@/components/layout/TopbarPublique"
import { BarreInfoPublique } from "@/components/layout/BarreInfoPublique"
import { BoutonContactFlottant } from "@/components/layout/BoutonContactFlottant"
import "@/styles/vitrine.css"
import { FooterPublique } from "@/components/layout/FooterPublique"
import { BoutonHautDePage } from "@/components/layout/BoutonHautDePage"
import { TopbarInterne } from "@/components/layout/TopbarInterne"
import { NotificationsDrawer } from "@/components/layout/NotificationsDrawer"
import { CommandPalette } from "@/components/layout/CommandPalette"
import { ForbiddenPage } from "@/components/shared/ForbiddenPage"
import { RouteErrorBoundary } from "@/components/shared/ErrorBoundary"
import { NotFoundPage } from "@/components/shared/NotFoundPage"
import { PageTransition } from "@/components/shared/PageTransition"
import { Skeleton } from "@/components/ui/skeleton"
import { TitreBreadcrumbProvider } from "@/contexts/TitreBreadcrumbContext"
import { PageIntrouvable } from "@/features/espace-public/components/PageIntrouvable"

const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })))
const MotDePasseOubliePage = lazy(() => import("@/features/auth/pages/MotDePasseOubliePage").then((m) => ({ default: m.MotDePasseOubliePage })))
const ResetPasswordPage = lazy(() => import("@/features/auth/pages/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })))
const TableauDeBordPresidence = lazy(() => import("@/features/tableau-de-bord/pages/TableauDeBordPresidence").then((m) => ({ default: m.TableauDeBordPresidence })))
const TableauDeBordEtablissement = lazy(() => import("@/features/tableau-de-bord/pages/TableauDeBordEtablissement").then((m) => ({ default: m.TableauDeBordEtablissement })))
const TableauDeBordDecideur = lazy(() => import("@/features/tableau-de-bord/pages/TableauDeBordDecideur").then((m) => ({ default: m.TableauDeBordDecideur })))
const PartenairesListePage = lazy(() => import("@/features/partenaires/pages/PartenairesListePage").then((m) => ({ default: m.PartenairesListePage })))
const PartenaireCreatePage = lazy(() => import("@/features/partenaires/pages/PartenaireCreatePage").then((m) => ({ default: m.PartenaireCreatePage })))
const PartenaireDetailPage = lazy(() => import("@/features/partenaires/pages/PartenaireDetailPage").then((m) => ({ default: m.PartenaireDetailPage })))
const ConventionsListePage = lazy(() => import("@/features/conventions/pages/ConventionsListePage").then((m) => ({ default: m.ConventionsListePage })))
const ConventionDetailPage = lazy(() => import("@/features/conventions/pages/ConventionDetailPage").then((m) => ({ default: m.ConventionDetailPage })))
const ConventionCreatePage = lazy(() => import("@/features/conventions/pages/ConventionCreatePage").then((m) => ({ default: m.ConventionCreatePage })))
const ConventionEditPage = lazy(() => import("@/features/conventions/pages/ConventionEditPage").then((m) => ({ default: m.ConventionEditPage })))
const ProjetsListePage = lazy(() => import("@/features/projets/pages/ProjetsListePage").then((m) => ({ default: m.ProjetsListePage })))
const ProjetDetailPage = lazy(() => import("@/features/projets/pages/ProjetDetailPage").then((m) => ({ default: m.ProjetDetailPage })))
const CotutellesListePage = lazy(() => import("@/features/cotutelles/pages/CotutellesListePage").then((m) => ({ default: m.CotutellesListePage })))
const CotutelleDetailPage = lazy(() => import("@/features/cotutelles/pages/CotutelleDetailPage").then((m) => ({ default: m.CotutelleDetailPage })))
const PublicationEditPage = lazy(() => import("@/features/publications/pages/PublicationEditPage").then((m) => ({ default: m.PublicationEditPage })))
const NotificationsPage = lazy(() => import("@/features/notifications/pages/NotificationsPage").then((m) => ({ default: m.NotificationsPage })))
const ArchivesPage = lazy(() => import("./features/archives/pages/ArchivesPage").then((m) => ({ default: m.ArchivesPage })))
const ArchiveDetailPage = lazy(() => import("./features/archives/pages/ArchiveDetailPage").then((m) => ({ default: m.ArchiveDetailPage })))
const ReferentielsPage = lazy(() => import("@/features/referentiels/pages/ReferentielsPage").then((m) => ({ default: m.ReferentielsPage })))
const EtablissementsListePage = lazy(() => import("@/features/etablissements/pages/EtablissementsListePage").then((m) => ({ default: m.EtablissementsListePage })))
const EtablissementDetailPage = lazy(() => import("@/features/etablissements/pages/EtablissementDetailPage").then((m) => ({ default: m.EtablissementDetailPage })))
const ParametresCompte = lazy(() => import("@/features/comptes/pages/ParametresCompte").then((m) => ({ default: m.ParametresCompte })))
const AccueilPage = lazy(() => import("@/features/espace-public/pages/AccueilPage").then((m) => ({ default: m.AccueilPage })))
const AProposPage = lazy(() => import("@/features/espace-public/pages/AProposPage").then((m) => ({ default: m.AProposPage })))
const EtablissementsPage = lazy(() => import("@/features/espace-public/pages/EtablissementsPage").then((m) => ({ default: m.EtablissementsPage })))
const ProjetsPartenariatsPubliquePage = lazy(() => import("@/features/espace-public/pages/ProjetsPartenariatsPubliquePage").then((m) => ({ default: m.ProjetsPartenariatsPubliquePage })))
const PublicationDetailPage = lazy(() => import("@/features/espace-public/pages/PublicationDetailPage").then((m) => ({ default: m.PublicationDetailPage })))
const ActualitesPage = lazy(() => import("@/features/espace-public/pages/ActualitesPage").then((m) => ({ default: m.ActualitesPage })))
const PublicProjetsListePage = lazy(() => import("@/features/espace-public/pages/PublicProjetsListePage").then((m) => ({ default: m.PublicProjetsListePage })))
const PublicProjetDetailPage = lazy(() => import("@/features/espace-public/pages/PublicProjetDetailPage").then((m) => ({ default: m.PublicProjetDetailPage })))
const PublicPartenairesListePage = lazy(() => import("@/features/espace-public/pages/PublicPartenairesListePage").then((m) => ({ default: m.PublicPartenairesListePage })))
const PublicPartenaireDetailPage = lazy(() => import("@/features/espace-public/pages/PublicPartenaireDetailPage").then((m) => ({ default: m.PublicPartenaireDetailPage })))
const PublicPartenariatsListePage = lazy(() => import("@/features/espace-public/pages/PublicPartenariatsListePage").then((m) => ({ default: m.PublicPartenariatsListePage })))
const PublicPartenariatDetailPage = lazy(() => import("@/features/espace-public/pages/PublicPartenariatDetailPage").then((m) => ({ default: m.PublicPartenariatDetailPage })))
const ContactPage = lazy(() => import("@/features/espace-public/pages/ContactPage").then((m) => ({ default: m.ContactPage })))
const RecherchePage = lazy(() => import("@/features/recherche/pages/RecherchePage").then((m) => ({ default: m.RecherchePage })))
const SynthesePage = lazy(() => import("@/features/synthese/pages/SynthesePage").then((m) => ({ default: m.SynthesePage })))
const SyntheseEtablissementPage = lazy(() => import("@/features/synthese/pages/SyntheseEtablissementPage").then((m) => ({ default: m.SyntheseEtablissementPage })))
const DocumentsListePage = lazy(() => import("@/features/documents/pages/DocumentsListePage").then((m) => ({ default: m.DocumentsListePage })))
const PublicationsListePage = lazy(() => import("@/features/publications/pages/PublicationsListePage").then((m) => ({ default: m.PublicationsListePage })))
const ProjetCreatePage = lazy(() => import("@/features/projets/pages/ProjetCreatePage").then((m) => ({ default: m.ProjetCreatePage })))
const ProjetEditPage = lazy(() => import("@/features/projets/pages/ProjetEditPage").then((m) => ({ default: m.ProjetEditPage })))
const PartenariatsListePage = lazy(() => import("@/features/partenariats/pages/PartenariatsListePage").then((m) => ({ default: m.PartenariatsListePage })))
const PartenariatCreatePage = lazy(() => import("@/features/partenariats/pages/PartenariatCreatePage").then((m) => ({ default: m.PartenariatCreatePage })))
const PartenariatDetailPage = lazy(() => import("@/features/partenariats/pages/PartenariatDetailPage").then((m) => ({ default: m.PartenariatDetailPage })))
const DocumentDetailPage = lazy(() => import("@/features/documents/pages/DocumentDetailPage").then((m) => ({ default: m.DocumentDetailPage })))
const DocumentUploadPage = lazy(() => import("@/features/documents/pages/DocumentUploadPage").then((m) => ({ default: m.DocumentUploadPage })))
const MessagesContactPage = lazy(() => import("@/features/messages-contact/pages/MessagesContactPage").then((m) => ({ default: m.MessagesContactPage })))
const ExportPage = lazy(() => import("@/features/export/pages/ExportPage").then((m) => ({ default: m.ExportPage })))
const HistoriquePage = lazy(() => import("@/features/historique/pages/HistoriquePage").then((m) => ({ default: m.HistoriquePage })))

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

function ChargePublique({ children }: { children: ReactNode }) {
  const reduire = useReducedMotion()
  return (
    <Suspense fallback={<ChargementRoute />}>
      {reduire ? children : <PageTransition>{children}</PageTransition>}
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

function ScrollToTopPublic() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [location.pathname, location.search, location.hash])

  return null
}

function LayoutPublic() {
  const location = useLocation()
  const reduire = useReducedMotion()
  const cheminPublic = location.pathname.replace(/\/+$/, "") || "/"
  // Les pages de liste définissent leur propre zone principale de résultats.
  const pageDeListe = ["/actualites", "/projets", "/partenariats", "/partenaires"].includes(cheminPublic)
  const ConteneurPrincipal = pageDeListe ? "div" : "main"
  return (
    <MotionConfig reducedMotion="user">
      <div className="vitrine flex min-h-screen flex-col">
        <ScrollToTopPublic />
        <a href="#contenu-principal" className="vt-skip">
          Aller au contenu
        </a>
        <BarreInfoPublique />
        <TopbarPublique />
        <ConteneurPrincipal id="contenu-principal" className="flex-1" tabIndex={-1}>
          {reduire ? (
            <div key={location.pathname}>
              <Outlet />
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          )}
        </ConteneurPrincipal>
        <FooterPublique />
        <BoutonHautDePage />
        <BoutonContactFlottant />
      </div>
    </MotionConfig>
  )
}

function LayoutInterne() {
  const [drawerNotifs, setDrawerNotifs] = useState(false)
  const [paletteOuverte, setPaletteOuverte] = useState(false)
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false)

  // La fenêtre ne défile pas dans l'espace interne : seul le contenu défile.
  useEffect(() => {
    document.body.classList.add("interface-verrouillee")
    return () => document.body.classList.remove("interface-verrouillee")
  }, [])

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
    <TitreBreadcrumbProvider>
      <div className="flex h-dvh overflow-hidden">
        {/* Sidebar desktop */}
        <div className="hidden h-full shrink-0 lg:block">
          <SidebarInterne />
        </div>

        {/* Tiroir sidebar mobile */}
        {menuMobileOuvert ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMenuMobileOuvert(false)}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 h-full w-[248px] max-w-[85vw]">
              <button
                type="button"
                onClick={() => setMenuMobileOuvert(false)}
                aria-label="Fermer la navigation"
                className="absolute -right-10 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)] shadow-[var(--shadow-md)]"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarInterne />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopbarInterne
            onOuvrirRecherche={() => setPaletteOuverte(true)}
            onOuvrirNotifications={() => setDrawerNotifs(true)}
            onOuvrirMenu={() => setMenuMobileOuvert(true)}
          />
          <main className="flex-1 overflow-y-auto p-[22px_28px_44px]">
            <div className="mb-3">
              <Breadcrumbs />
            </div>
            <Outlet />
          </main>
        </div>
        <NotificationsDrawer ouvert={drawerNotifs} onFermer={() => setDrawerNotifs(false)} />
        <CommandPalette ouvert={paletteOuverte} onFermer={() => setPaletteOuverte(false)} />
      </div>
    </TitreBreadcrumbProvider>
  )
}

const router = createBrowserRouter([
  {
    element: <LayoutPublic />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: <ChargePublique><RedirectionAccueil /></ChargePublique> },
      { path: "/a-propos", element: <ChargePublique><AProposPage /></ChargePublique> },
      { path: "/etablissements", element: <ChargePublique><EtablissementsPage /></ChargePublique> },
      { path: "/partenaires", element: <ChargePublique><PublicPartenairesListePage /></ChargePublique> },
      { path: "/partenaires/:id", element: <ChargePublique><PublicPartenaireDetailPage /></ChargePublique> },
      { path: "/projets-partenariats", element: <ChargePublique><ProjetsPartenariatsPubliquePage /></ChargePublique> },
      { path: "/projets-partenariats/publication/:id", element: <ChargePublique><PublicationDetailPage /></ChargePublique> },
      { path: "/actualites", element: <ChargePublique><ActualitesPage /></ChargePublique> },
      { path: "/actualites/:id", element: <ChargePublique><PublicationDetailPage /></ChargePublique> },
      { path: "/projets", element: <ChargePublique><PublicProjetsListePage /></ChargePublique> },
      { path: "/projets/:id", element: <ChargePublique><PublicProjetDetailPage /></ChargePublique> },
      { path: "/partenariats", element: <ChargePublique><PublicPartenariatsListePage /></ChargePublique> },
      { path: "/partenariats/:id", element: <ChargePublique><PublicPartenariatDetailPage /></ChargePublique> },
      { path: "/contact", element: <ChargePublique><ContactPage /></ChargePublique> },
      // Les chemins publics sans correspondance affichent la page 404 de la vitrine.
      { path: "*", element: <ChargePublique><PageIntrouvable /></ChargePublique> },
    ],
  },
  { path: "/connexion", element: <Charge><LoginPage /></Charge>, errorElement: <RouteErrorBoundary /> },
  { path: "/mot-de-passe-oublie", element: <Charge><MotDePasseOubliePage /></Charge>, errorElement: <RouteErrorBoundary /> },
  { path: "/reset-password", element: <Charge><ResetPasswordPage /></Charge>, errorElement: <RouteErrorBoundary /> },
  {
    element: <LayoutInterne />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/presidence", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><TableauDeBordPresidence /></Charge></RouteProtegee> },
      { path: "/presidence/conventions", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ConventionsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/conventions/nouveau", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ConventionCreatePage /></Charge></RouteProtegee> },
      { path: "/presidence/conventions/:id/modifier", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ConventionEditPage /></Charge></RouteProtegee> },
      { path: "/presidence/conventions/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ConventionDetailPage /></Charge></RouteProtegee> },
      { path: "/presidence/referentiels", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ReferentielsPage /></Charge></RouteProtegee> },
      { path: "/presidence/etablissements", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><EtablissementsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/etablissements/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><EtablissementDetailPage /></Charge></RouteProtegee> },
      { path: "/presidence/archives", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ArchivesPage /></Charge></RouteProtegee> },
      { path: "/presidence/archives/:type/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ArchiveDetailPage /></Charge></RouteProtegee> },
      { path: "/presidence/historique", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><HistoriquePage /></Charge></RouteProtegee> },
      { path: "/presidence/export", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ExportPage /></Charge></RouteProtegee> },
      { path: "/presidence/exports", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ExportPage /></Charge></RouteProtegee> },
      { path: "/presidence/recherche", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><RecherchePage /></Charge></RouteProtegee> },
      { path: "/presidence/synthese", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><SynthesePage /></Charge></RouteProtegee> },
      { path: "/presidence/synthese/:etablissementId", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><SyntheseEtablissementPage /></Charge></RouteProtegee> },
      { path: "/decideur/synthese", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><SynthesePage /></Charge></RouteProtegee> },
      { path: "/decideur/synthese/:etablissementId", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><SyntheseEtablissementPage /></Charge></RouteProtegee> },
      { path: "/presidence/documents", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><DocumentsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/documents/nouveau", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><DocumentUploadPage /></Charge></RouteProtegee> },
      { path: "/presidence/documents/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><DocumentDetailPage /></Charge></RouteProtegee> },
      { path: "/presidence/publications", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PublicationsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/messages", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><MessagesContactPage /></Charge></RouteProtegee> },
      { path: "/etablissement/messages", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><MessagesContactPage /></Charge></RouteProtegee> },
      { path: "/presidence/notifications", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><NotificationsPage /></Charge></RouteProtegee> },
      { path: "/etablissement/notifications", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><NotificationsPage /></Charge></RouteProtegee> },
      { path: "/presidence/projets", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ProjetsListePage /></Charge></RouteProtegee> },
      { path: "/presidence/projets/nouveau", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ProjetCreatePage /></Charge></RouteProtegee> },
      { path: "/presidence/projets/:id/modifier", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ProjetEditPage /></Charge></RouteProtegee> },
      { path: "/presidence/publications/:projetId", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><PublicationEditPage /></Charge></RouteProtegee> },
      { path: "/presidence/projets/:id", element: <RouteProtegee rolesAutorises={["PRESIDENCE"]}><Charge><ProjetDetailPage /></Charge></RouteProtegee> },
      { path: "/etablissement/projets", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><ProjetsListePage /></Charge></RouteProtegee> },
      { path: "/etablissement/projets/nouveau", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><ProjetCreatePage /></Charge></RouteProtegee> },
      { path: "/etablissement/projets/:id/modifier", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><ProjetEditPage /></Charge></RouteProtegee> },
      { path: "/etablissement/projets/:id", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><ProjetDetailPage /></Charge></RouteProtegee> },
      { path: "/etablissement/archives", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><ArchivesPage /></Charge></RouteProtegee> },
      { path: "/etablissement/archives/:type/:id", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><ArchiveDetailPage /></Charge></RouteProtegee> },
      { path: "/etablissement/historique", element: <RouteProtegee rolesAutorises={["ETABLISSEMENT"]}><Charge><HistoriquePage /></Charge></RouteProtegee> },
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
      { path: "/decideur/archives", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><ArchivesPage /></Charge></RouteProtegee> },
      { path: "/decideur/archives/:type/:id", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><ArchiveDetailPage /></Charge></RouteProtegee> },
      { path: "/decideur/historique", element: <RouteProtegee rolesAutorises={["DECIDEUR"]}><Charge><HistoriquePage /></Charge></RouteProtegee> },

      { path: "/presidence/partenaires-partenariats", element: <Navigate to="/presidence/partenaires-partenariats/partenaires" replace /> },
      { path: "/etablissement/partenaires-partenariats", element: <Navigate to="/etablissement/partenaires-partenariats/partenaires" replace /> },
      { path: "/decideur/partenaires-partenariats", element: <Navigate to="/decideur/partenaires-partenariats/partenaires" replace /> },
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
    ],
  },
  // Les URL inconnues des espaces internes gardent leur page 404 dédiée.
  { path: "/presidence/*", element: <NotFoundPage /> },
  { path: "/etablissement/*", element: <NotFoundPage /> },
  { path: "/decideur/*", element: <NotFoundPage /> },
  { path: "*", element: <NotFoundPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}