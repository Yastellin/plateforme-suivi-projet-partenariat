// src/components/shared/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react"
import { TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  erreur: Error | null
}

// Error Boundary global (section 1) : intercepte toute erreur de rendu
// pour afficher un ecran de secours plutot qu'une page blanche.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
          <TriangleAlert size={48} className="text-destructive" strokeWidth={1.5} />
          <h1 className="font-heading text-xl font-semibold">Une erreur est survenue</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Une erreur inattendue s'est produite. Vous pouvez recharger la page pour reessayer.
          </p>
          <Button onClick={() => window.location.reload()}>Recharger la page</Button>
        </div>
      )
    }

    return this.props.children
  }
}
