// src/features/auth/pages/LoginPage.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { LoginForm } from "@/features/auth/components/LoginForm"

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-[430px] overflow-hidden">
        <div className="woven-accent" />
        <CardHeader className="px-[26px] pt-6 pb-0">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="font-heading text-[24px] font-bold tracking-tight">Espace interne</h1>
          <p className="text-[13px] text-muted-foreground">
            Connectez-vous avec votre compte Presidence, etablissement ou decideur.
          </p>
        </CardHeader>
        <CardContent className="px-[26px] pb-[26px]">
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}