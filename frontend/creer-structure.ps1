# creer-structure.ps1
# Cree l'arborescence complete du prompt (section 9) sans ecraser l'existant.

$ErrorActionPreference = "Stop"

function Assurer-Dossier {
    param([string]$Chemin)
    if (-not (Test-Path -LiteralPath $Chemin -PathType Container)) {
        New-Item -ItemType Directory -Path $Chemin -Force | Out-Null
        Write-Host "Dossier cree : $Chemin"
    }
}

function Assurer-Fichier {
    param([string]$Chemin)

    $dossierParent = Split-Path -Path $Chemin -Parent
    Assurer-Dossier -Chemin $dossierParent

    if (-not (Test-Path -LiteralPath $Chemin -PathType Leaf)) {
        $cheminAffiche = $Chemin -replace [regex]::Escape((Get-Location).Path + "\"), ""
        $cheminAffiche = $cheminAffiche -replace "\\", "/"

        $extension = [System.IO.Path]::GetExtension($Chemin)
        if ($extension -eq ".css") {
            $entete = "/* $cheminAffiche */"
        } else {
            $entete = "// $cheminAffiche"
        }

        Set-Content -LiteralPath $Chemin -Value $entete -Encoding utf8
        Write-Host "Fichier cree  : $Chemin"
    } else {
        Write-Host "Deja present  : $Chemin (ignore)"
    }
}

# ---------- Dossiers de base (racine) ----------
Assurer-Dossier "public"

# ---------- src/styles ----------
Assurer-Fichier "src\styles\globals.css"

# ---------- src (fichiers racine de src deja existants normalement) ----------
Assurer-Fichier "src\router.tsx"

# ---------- src/components/layout ----------
Assurer-Fichier "src\components\layout\SidebarInterne.tsx"
Assurer-Fichier "src\components\layout\TopbarPublique.tsx"
Assurer-Fichier "src\components\layout\Breadcrumbs.tsx"
Assurer-Fichier "src\components\layout\ThemeToggle.tsx"

# ---------- src/components/shared ----------
Assurer-Fichier "src\components\shared\StatusBadge.tsx"
Assurer-Fichier "src\components\shared\DataTable.tsx"
Assurer-Fichier "src\components\shared\FacetedFilters.tsx"
Assurer-Fichier "src\components\shared\ConfirmDialog.tsx"
Assurer-Fichier "src\components\shared\Dropzone.tsx"
Assurer-Fichier "src\components\shared\SkeletonCard.tsx"
Assurer-Fichier "src\components\shared\AnimatedCounter.tsx"
Assurer-Fichier "src\components\shared\HybridCarousel.tsx"
Assurer-Fichier "src\components\shared\InfiniteMarquee.tsx"
Assurer-Fichier "src\components\shared\EmptyState.tsx"
Assurer-Fichier "src\components\shared\ErrorBoundary.tsx"
Assurer-Fichier "src\components\shared\ForbiddenPage.tsx"
Assurer-Fichier "src\components\shared\NotFoundPage.tsx"

# ---------- src/components/forms ----------
Assurer-Fichier "src\components\forms\inputs\TextInputSanitized.tsx"
Assurer-Fichier "src\components\forms\inputs\PhoneInputSanitized.tsx"
Assurer-Fichier "src\components\forms\inputs\EmailInput.tsx"
Assurer-Fichier "src\components\forms\wizard\Wizard.tsx"
Assurer-Fichier "src\components\forms\wizard\WizardStep.tsx"
Assurer-Fichier "src\components\forms\wizard\WizardProgressBar.tsx"

# ---------- src/features/auth ----------
Assurer-Fichier "src\features\auth\api\useLogin.ts"
Assurer-Fichier "src\features\auth\components\LoginForm.tsx"
Assurer-Fichier "src\features\auth\pages\LoginPage.tsx"

# ---------- src/features/comptes ----------
Assurer-Fichier "src\features\comptes\api\useCompte.ts"
Assurer-Fichier "src\features\comptes\api\useChangerMotDePasse.ts"
Assurer-Fichier "src\features\comptes\components\FormulaireMotDePasse.tsx"
Assurer-Fichier "src\features\comptes\pages\ParametresCompte.tsx"

# ---------- src/features/partenaires ----------
Assurer-Fichier "src\features\partenaires\api\usePartenaires.ts"
Assurer-Fichier "src\features\partenaires\api\usePartenaire.ts"
Assurer-Fichier "src\features\partenaires\api\useCreatePartenaire.ts"
Assurer-Fichier "src\features\partenaires\api\useUpdatePartenaire.ts"
Assurer-Fichier "src\features\partenaires\api\useArchiverPartenaire.ts"
Assurer-Fichier "src\features\partenaires\api\useRechercheDoublon.ts"
Assurer-Fichier "src\features\partenaires\api\useContacts.ts"
Assurer-Fichier "src\features\partenaires\components\PartenaireCard.tsx"
Assurer-Fichier "src\features\partenaires\components\PartenaireForm.tsx"
Assurer-Fichier "src\features\partenaires\components\PartenaireFiltres.tsx"
Assurer-Fichier "src\features\partenaires\components\ContactForm.tsx"
Assurer-Fichier "src\features\partenaires\pages\PartenairesListePage.tsx"
Assurer-Fichier "src\features\partenaires\pages\PartenaireDetailPage.tsx"

# ---------- src/features/partenariats ----------
Assurer-Fichier "src\features\partenariats\api\usePartenariats.ts"
Assurer-Fichier "src\features\partenariats\api\usePartenariat.ts"
Assurer-Fichier "src\features\partenariats\api\useCreatePartenariat.ts"
Assurer-Fichier "src\features\partenariats\api\useUpdatePartenariat.ts"
Assurer-Fichier "src\features\partenariats\api\useArchiverPartenariat.ts"
Assurer-Fichier "src\features\partenariats\api\useSoumettrePartenariat.ts"
Assurer-Fichier "src\features\partenariats\components\PartenariatWizard.tsx"
Assurer-Fichier "src\features\partenariats\components\SelectionEtablissements.tsx"
Assurer-Fichier "src\features\partenariats\components\SelectionPartenaires.tsx"
Assurer-Fichier "src\features\partenariats\components\PartenariatFiltres.tsx"
Assurer-Fichier "src\features\partenariats\components\BoutonSoumettre.tsx"
Assurer-Fichier "src\features\partenariats\pages\PartenariatsListePage.tsx"
Assurer-Fichier "src\features\partenariats\pages\PartenariatDetailPage.tsx"

# ---------- src/features/cotutelles ----------
Assurer-Fichier "src\features\cotutelles\api\useCotutelles.ts"
Assurer-Fichier "src\features\cotutelles\api\useCotutelle.ts"
Assurer-Fichier "src\features\cotutelles\api\useCreateCotutelle.ts"
Assurer-Fichier "src\features\cotutelles\api\useUpdateCotutelle.ts"
Assurer-Fichier "src\features\cotutelles\components\CotutelleForm.tsx"
Assurer-Fichier "src\features\cotutelles\components\CotutelleCard.tsx"
Assurer-Fichier "src\features\cotutelles\pages\CotutellesListePage.tsx"
Assurer-Fichier "src\features\cotutelles\pages\CotutelleDetailPage.tsx"

# ---------- src/features/projets ----------
Assurer-Fichier "src\features\projets\api\useProjets.ts"
Assurer-Fichier "src\features\projets\api\useProjet.ts"
Assurer-Fichier "src\features\projets\api\useCreateProjet.ts"
Assurer-Fichier "src\features\projets\api\useUpdateProjet.ts"
Assurer-Fichier "src\features\projets\api\useArchiverProjet.ts"
Assurer-Fichier "src\features\projets\api\useSoumettreProjet.ts"
Assurer-Fichier "src\features\projets\api\useAvancement.ts"
Assurer-Fichier "src\features\projets\components\ProjetWizard.tsx"
Assurer-Fichier "src\features\projets\components\ProjetFiltres.tsx"
Assurer-Fichier "src\features\projets\components\ProjetOngletsFiche.tsx"
Assurer-Fichier "src\features\projets\components\SelectionPorteur.tsx"
Assurer-Fichier "src\features\projets\components\SelectionBailleurs.tsx"
Assurer-Fichier "src\features\projets\components\SelectionBeneficiaires.tsx"
Assurer-Fichier "src\features\projets\components\SelectionSites.tsx"
Assurer-Fichier "src\features\projets\components\IndicateurAvancement.tsx"
Assurer-Fichier "src\features\projets\components\BoutonSoumettre.tsx"
Assurer-Fichier "src\features\projets\activites\api\useActivites.ts"
Assurer-Fichier "src\features\projets\activites\api\useCreateActivite.ts"
Assurer-Fichier "src\features\projets\activites\api\useToggleActivite.ts"
Assurer-Fichier "src\features\projets\activites\components\ActiviteListe.tsx"
Assurer-Fichier "src\features\projets\activites\components\ActiviteForm.tsx"
Assurer-Fichier "src\features\projets\chronogramme\api\useChronogramme.ts"
Assurer-Fichier "src\features\projets\chronogramme\api\useCreateEntreeChronogramme.ts"
Assurer-Fichier "src\features\projets\chronogramme\components\ChronogrammeForm.tsx"
Assurer-Fichier "src\features\projets\pages\ProjetsListePage.tsx"
Assurer-Fichier "src\features\projets\pages\ProjetDetailPage.tsx"

# ---------- src/features/conventions ----------
Assurer-Fichier "src\features\conventions\api\useConventions.ts"
Assurer-Fichier "src\features\conventions\api\useConvention.ts"
Assurer-Fichier "src\features\conventions\api\useCreateConvention.ts"
Assurer-Fichier "src\features\conventions\api\useUpdateConvention.ts"
Assurer-Fichier "src\features\conventions\api\useArchiverConvention.ts"
Assurer-Fichier "src\features\conventions\api\useUpdateEtapeCircuit.ts"
Assurer-Fichier "src\features\conventions\components\ConventionForm.tsx"
Assurer-Fichier "src\features\conventions\components\ConventionFiltres.tsx"
Assurer-Fichier "src\features\conventions\components\CircuitTraitementStepper.tsx"
Assurer-Fichier "src\features\conventions\pages\ConventionsListePage.tsx"
Assurer-Fichier "src\features\conventions\pages\ConventionDetailPage.tsx"

# ---------- src/features/documents ----------
Assurer-Fichier "src\features\documents\api\useUploadDocument.ts"
Assurer-Fichier "src\features\documents\api\useTelechargerDocument.ts"
Assurer-Fichier "src\features\documents\api\useVersionsDocument.ts"
Assurer-Fichier "src\features\documents\components\DocumentDropzone.tsx"
Assurer-Fichier "src\features\documents\components\DocumentVersionsListe.tsx"

# ---------- src/features/publications ----------
Assurer-Fichier "src\features\publications\api\usePublication.ts"
Assurer-Fichier "src\features\publications\api\useCreatePublication.ts"
Assurer-Fichier "src\features\publications\api\useUpdatePublication.ts"
Assurer-Fichier "src\features\publications\api\usePublierPublication.ts"
Assurer-Fichier "src\features\publications\api\usePhotosPublication.ts"
Assurer-Fichier "src\features\publications\components\PublicationEditeur.tsx"
Assurer-Fichier "src\features\publications\components\GaleriePhotosReordonnable.tsx"
Assurer-Fichier "src\features\publications\pages\PublicationEditPage.tsx"

# ---------- src/features/archives ----------
Assurer-Fichier "src\features\archives\api\useArchives.ts"
Assurer-Fichier "src\features\archives\components\ArchivesFiltres.tsx"
Assurer-Fichier "src\features\archives\pages\ArchivesPage.tsx"

# ---------- src/features/notifications ----------
Assurer-Fichier "src\features\notifications\api\useNotifications.ts"
Assurer-Fichier "src\features\notifications\api\useMarquerLue.ts"
Assurer-Fichier "src\features\notifications\api\useNotificationsPolling.ts"
Assurer-Fichier "src\features\notifications\components\NotificationItem.tsx"
Assurer-Fichier "src\features\notifications\components\NotificationBadge.tsx"
Assurer-Fichier "src\features\notifications\pages\NotificationsPage.tsx"

# ---------- src/features/synthese ----------
Assurer-Fichier "src\features\synthese\api\useSynthese.ts"
Assurer-Fichier "src\features\synthese\api\useCreateSyntheseItem.ts"
Assurer-Fichier "src\features\synthese\api\useCreatePartenaireStrategique.ts"
Assurer-Fichier "src\features\synthese\components\SyntheseCompteurs.tsx"
Assurer-Fichier "src\features\synthese\components\SyntheseFormulaireNarratif.tsx"
Assurer-Fichier "src\features\synthese\pages\SynthesePage.tsx"

# ---------- src/features/tableau-de-bord ----------
Assurer-Fichier "src\features\tableau-de-bord\api\useTableauDeBord.ts"
Assurer-Fichier "src\features\tableau-de-bord\api\useComparatifEtablissements.ts"
Assurer-Fichier "src\features\tableau-de-bord\api\useEcheancier.ts"
Assurer-Fichier "src\features\tableau-de-bord\components\CompteursGlobaux.tsx"
Assurer-Fichier "src\features\tableau-de-bord\components\GraphiqueStatuts.tsx"
Assurer-Fichier "src\features\tableau-de-bord\components\GraphiqueComparatif.tsx"
Assurer-Fichier "src\features\tableau-de-bord\components\EcheancierListe.tsx"
Assurer-Fichier "src\features\tableau-de-bord\pages\TableauDeBordPresidence.tsx"
Assurer-Fichier "src\features\tableau-de-bord\pages\TableauDeBordEtablissement.tsx"
Assurer-Fichier "src\features\tableau-de-bord\pages\TableauDeBordDecideur.tsx"

# ---------- src/features/export ----------
Assurer-Fichier "src\features\export\api\useExport.ts"
Assurer-Fichier "src\features\export\components\ExportButton.tsx"
Assurer-Fichier "src\features\export\components\ExportModal.tsx"

# ---------- src/features/espace-public ----------
Assurer-Fichier "src\features\espace-public\api\usePublicAccueil.ts"
Assurer-Fichier "src\features\espace-public\api\usePublicPublications.ts"
Assurer-Fichier "src\features\espace-public\api\usePublicEtablissements.ts"
Assurer-Fichier "src\features\espace-public\api\usePublicPartenaires.ts"
Assurer-Fichier "src\features\espace-public\components\HeroAccueil.tsx"
Assurer-Fichier "src\features\espace-public\components\SectionEtablissements.tsx"
Assurer-Fichier "src\features\espace-public\components\SectionPartenaires.tsx"
Assurer-Fichier "src\features\espace-public\components\FormulaireContact.tsx"
Assurer-Fichier "src\features\espace-public\pages\AccueilPage.tsx"
Assurer-Fichier "src\features\espace-public\pages\AProposPage.tsx"
Assurer-Fichier "src\features\espace-public\pages\EtablissementsPage.tsx"
Assurer-Fichier "src\features\espace-public\pages\PartenairesPubliquePage.tsx"
Assurer-Fichier "src\features\espace-public\pages\ProjetsPartenariatsPubliquePage.tsx"
Assurer-Fichier "src\features\espace-public\pages\PublicationDetailPage.tsx"
Assurer-Fichier "src\features\espace-public\pages\ContactPage.tsx"

# ---------- src/lib/validators ----------
Assurer-Fichier "src\lib\validators\partenaire.schema.ts"
Assurer-Fichier "src\lib\validators\partenariat.schema.ts"
Assurer-Fichier "src\lib\validators\projet.schema.ts"
Assurer-Fichier "src\lib\validators\convention.schema.ts"
Assurer-Fichier "src\lib\validators\contact.schema.ts"

# ---------- src/hooks ----------
Assurer-Fichier "src\hooks\useAuth.ts"
Assurer-Fichier "src\hooks\useDebounce.ts"
Assurer-Fichier "src\hooks\useTheme.ts"
Assurer-Fichier "src\hooks\useVisibilityGuard.ts"

# ---------- src/types ----------
Assurer-Fichier "src\types\api.ts"

Write-Host ""
Write-Host "Termine. Les fichiers deja presents ont ete conserves tels quels."