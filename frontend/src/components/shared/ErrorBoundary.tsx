// src/components/shared/ErrorBoundary.tsx
import {
  Component,
  useEffect,
  type ErrorInfo,
  type ReactNode,
} from "react"
import { House, RotateCcw, TriangleAlert } from "lucide-react"
import { isRouteErrorResponse, useRouteError } from "react-router-dom"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  erreur: Error | null
}

interface EcranErreurProps {
  titre: string
  description: string
}

function EcranErreur({ titre, description }: EcranErreurProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-page-bg)] px-4 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--status-expire-bg)]">
        <TriangleAlert
          className="h-7 w-7 text-[var(--status-expire-fg)]"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <div>
        <h1 className="font-heading text-xl font-semibold">{titre}</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={() => window.location.reload()}>
          <RotateCcw aria-hidden="true" />
          Réessayer
        </Button>
        <Button asChild variant="outline">
          <a href="/">
            <House aria-hidden="true" />
            Retour à l'accueil
          </a>
        </Button>
      </div>
    </div>
  )
}

// Intercepte les erreurs qui surviennent hors du routeur.
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { erreur: null }

  static getDerivedStateFromError(erreur: Error): ErrorBoundaryState {
    return { erreur }
  }

  componentDidCatch(erreur: Error, infos: ErrorInfo) {
    console.error("Erreur de rendu interceptee:", erreur, infos.componentStack)
  }

  render() {
    if (this.state.erreur) {
      return (
        <EcranErreur
          titre="Une erreur est survenue"
          description="Une erreur inattendue empêche l'affichage de l'application. Réessayez ou revenez à l'accueil."
        />
      )
    }

    return this.props.children
  }
}

/** Repli dédié aux erreurs capturées par React Router. */
export function RouteErrorBoundary() {
  const erreur = useRouteError()

  useEffect(() => {
    console.error("Erreur de route interceptee:", erreur)
  }, [erreur])

  const estIntrouvable = isRouteErrorResponse(erreur) && erreur.status === 404

  return (
    <EcranErreur
      titre={estIntrouvable ? "Page introuvable" : "Cette page n'a pas pu s'afficher"}
      description={
        estIntrouvable
          ? "La page demandée n'existe pas ou n'est plus disponible."
          : "Une erreur inattendue s'est produite. Réessayez ou revenez à l'accueil."
      }
    />
  )
}
