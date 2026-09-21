// src/components/shared/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}
interface State {
  aPlante: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { aPlante: false }

  static getDerivedStateFromError(): State {
    return { aPlante: true }
  }

  componentDidCatch(erreur: Error, info: ErrorInfo) {
    console.error("Erreur interceptee par ErrorBoundary", erreur, info)
  }

  render() {
    if (this.state.aPlante) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
          <AlertTriangle size={48} className="text-muted-foreground" />
          <h1 className="font-heading text-xl font-semibold">Une erreur est survenue</h1>
          <p className="text-muted-foreground">Merci de recharger la page.</p>
          <Button onClick={() => window.location.reload()}>Recharger</Button>
        </div>
      )
    }
    return this.props.children
  }
}