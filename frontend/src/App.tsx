// src/App.tsx
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/sonner"
import { queryClient } from "@/lib/query-client"
import { AuthProvider } from "@/features/auth/AuthProvider"
import { ThemeProvider } from "@/hooks/useTheme"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { IdentiteVisuelleProvider } from "@/contexts/IdentiteVisuelleProvider"
import { AppRouter } from "@/router"

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <IdentiteVisuelleProvider>
          <ThemeProvider>
            <AuthProvider>
              <AppRouter />
              <Toaster richColors position="top-right" />
            </AuthProvider>
          </ThemeProvider>
        </IdentiteVisuelleProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App