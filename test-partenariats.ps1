# test-partenariats.ps1
# Test complet du module Partenariinvoke-apits

$API = "http://localhost:3000/api"
$PASS = "password123"

$script:TESTS_PASS = 0
$script:TESTS_FAIL = 0

    function Check {
        param($Label, $Expected, $Actual)
        if ("$Expected" -eq "$Actual") {
            Write-Host "[OK] $Label (attendu: $Expected, recu: $Actual)" -ForegroundColor Green
            $script:TESTS_PASS++
        } else {
            Write-Host "[ECHEC] $Label (attendu: $Expected, recu: $Actual)" -ForegroundColor Red
            $script:TESTS_FAIL++
        }
    }

    function Section {
        param($Title)
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host $Title -ForegroundColor Cyan
        Write-Host "============================================" -ForegroundColor Cyan
    }

    function Invoke-Api {
        param([string]$Method, [string]$Url, [string]$Token, [object]$Body)
        $headers = @{ "Content-Type" = "application/json" }
        if ($Token) { $headers["Authorization"] = "Bearer $Token" }
        $params = @{ Method = $Method; Uri = $Url; Headers = $headers; UseBasicParsing = $true }
        if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 10 -Compress) }

        try {
            $response = Invoke-WebRequest @params
            return @{ StatusCode = $response.StatusCode; Content = $response.Content | ConvertFrom-Json }
        } catch {
            $statusCode = 0
            $content = $null

            if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
                try { $content = $_.ErrorDetails.Message | ConvertFrom-Json }
                catch { $content = $_.ErrorDetails.Message }
            } elseif ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
            }

            if (-not $statusCode -and $_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
            }

            return @{ StatusCode = $statusCode; Content = $content }
        }
    }

    function AfficherErreur {
        param($Reponse)
        if ($Reponse.Content -and $Reponse.Content.message) {
            Write-Host "  Message : $($Reponse.Content.message)" -ForegroundColor Yellow
            if ($Reponse.Content.errors) {
                Write-Host "  Details : $($Reponse.Content.errors -join ' | ')" -ForegroundColor Yellow
            }
        }
    }

# ============================================
# 0. LOGIN
# ============================================
Section "0. Authentification"

$loginPres = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "presidence@univ-fianarantsoa.mg"; mot_de_passe = $PASS
}
$TOKEN_PRES = $loginPres.Content.data.access_token

$loginEtab = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "fds@univ-fianarantsoa.mg"; mot_de_passe = $PASS
}
$TOKEN_ETAB = $loginEtab.Content.data.access_token

$loginDec = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "president@univ-fianarantsoa.mg"; mot_de_passe = $PASS
}
$TOKEN_DEC = $loginDec.Content.data.access_token

if (-not $TOKEN_PRES) { Write-Host "Echec login PRESIDENCE" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Login PRESIDENCE" -ForegroundColor Green
Write-Host "[OK] Login ETABLISSEMENT" -ForegroundColor Green
Write-Host "[OK] Login DECIDEUR" -ForegroundColor Green

# ============================================
# 1. RECUPERATION DES IDS NECESSAIRES
# ============================================
Section "1. Recuperation des IDs"

# Recuperer l'etablissement du compte connecte (FDS)
$rMe = Invoke-Api -Method GET -Url "$API/auth/me" -Token $TOKEN_ETAB
$ETAB_ID = $rMe.Content.data.etablissement_id
Write-Host "ETABLISSEMENT ID (FDS) : $ETAB_ID"

$rPart = Invoke-Api -Method GET -Url "$API/partenaires" -Token $TOKEN_PRES
$PARTENAIRE_ID = $rPart.Content.data.data[0].id
Write-Host "PARTENAIRE ID : $PARTENAIRE_ID"

if (-not $ETAB_ID -or -not $PARTENAIRE_ID) {
    Write-Host "Impossible de recuperer les IDs necessaires (etablissement ou partenaire)" -ForegroundColor Red
    exit 1
}

# ============================================
# 2. CREATION D'UN PARTENARIAT
# ============================================
Section "2. Creation d'un partenariat"

$r = Invoke-Api -Method POST -Url "$API/partenariats" -Token $TOKEN_ETAB -Body @{
    intitule = "Partenariat Test Automatise"
    objet = "Validation des endpoints Partenariats"
    domaine = "RECHERCHE"
    date_debut = "2026-01-01T00:00:00.000Z"
    date_fin = "2028-12-31T00:00:00.000Z"
    statut = "BROUILLON"
    actions_realisees = "Premieres reunions effectuees"
    etablissements_ids = @($ETAB_ID)
    partenaires_ids = @($PARTENAIRE_ID)
}
Check "Creation partenariat (201)" 201 $r.StatusCode
if ($r.StatusCode -ne 201) { AfficherErreur $r }
$PARTENARIAT_ID = $r.Content.data.id
Check "Intitule" "Partenariat Test Automatise" $r.Content.data.intitule
Check "Statut BROUILLON" "BROUILLON" $r.Content.data.statut
Check "Domaine RECHERCHE" "RECHERCHE" $r.Content.data.domaine
Check "Archive = false" "false" "$($r.Content.data.archive)".ToLower()
Write-Host "PARTENARIAT ID : $PARTENARIAT_ID"

# ============================================
# 3. LISTE + FILTRES
# ============================================
Section "3. Liste et filtres"

$r = Invoke-Api -Method GET -Url "$API/partenariats" -Token $TOKEN_ETAB
Check "Liste partenariats" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/partenariats?statut=BROUILLON" -Token $TOKEN_ETAB
Check "Filtre statut=BROUILLON" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/partenariats?domaine=RECHERCHE" -Token $TOKEN_ETAB
Check "Filtre domaine=RECHERCHE" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/partenariats?page=1&limit=5" -Token $TOKEN_ETAB
Check "Pagination" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/partenariats?archive=false" -Token $TOKEN_ETAB
Check "Filtre archive=false" 200 $r.StatusCode

# ============================================
# 4. DETAIL
# ============================================
Section "4. Detail"

$r = Invoke-Api -Method GET -Url "$API/partenariats/$PARTENARIAT_ID" -Token $TOKEN_ETAB
Check "GET /partenariats/:id" 200 $r.StatusCode
Check "Detail intitule" "Partenariat Test Automatise" $r.Content.data.intitule
Check "Associations etablissements presentes" $true ($null -ne $r.Content.data.etablissements)
Check "Associations partenaires presentes" $true ($null -ne $r.Content.data.partenaires)

$r = Invoke-Api -Method GET -Url "$API/partenariats/00000000-0000-0000-0000-000000000000" -Token $TOKEN_ETAB
Check "GET inexistant (404)" 404 $r.StatusCode

# ============================================
# 5. MODIFICATION (brouillon)
# ============================================
Section "5. Modification"

$r = Invoke-Api -Method PATCH -Url "$API/partenariats/$PARTENARIAT_ID" -Token $TOKEN_ETAB -Body @{
    intitule = "Partenariat Test Automatise v2"
    actions_en_cours = "Preparation du projet commun"
    difficultes_contraintes = "Financement partiel"
}
Check "Modification (200)" 200 $r.StatusCode
Check "Intitule modifie" "Partenariat Test Automatise v2" $r.Content.data.intitule
Check "Statut reste BROUILLON" "BROUILLON" $r.Content.data.statut
Check "Champ narratif actions_en_cours" "Preparation du projet commun" $r.Content.data.actions_en_cours

# ============================================
# 6. PERMISSIONS
# ============================================
Section "6. Permissions"

# Decideur peut lire
$r = Invoke-Api -Method GET -Url "$API/partenariats" -Token $TOKEN_DEC
Check "Lecture par Decideur (200)" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/partenariats/$PARTENARIAT_ID" -Token $TOKEN_DEC
Check "Detail par Decideur (200)" 200 $r.StatusCode

# Decideur ne peut pas creer
$r = Invoke-Api -Method POST -Url "$API/partenariats" -Token $TOKEN_DEC -Body @{
    intitule = "Interdit"
    domaine = "RECHERCHE"
    date_debut = "2026-01-01T00:00:00.000Z"
    etablissements_ids = @($ETAB_ID)
    partenaires_ids = @($PARTENAIRE_ID)
}
Check "Creation par Decideur (403)" 403 $r.StatusCode

# Decideur ne peut pas modifier
$r = Invoke-Api -Method PATCH -Url "$API/partenariats/$PARTENARIAT_ID" -Token $TOKEN_DEC -Body @{
    intitule = "Interdit"
}
Check "Modification par Decideur (403)" 403 $r.StatusCode

# ============================================
# 7. SOUMISSION
# ============================================
Section "7. Soumission"

$r = Invoke-Api -Method POST -Url "$API/partenariats/$PARTENARIAT_ID/soumettre" -Token $TOKEN_ETAB
Check "Soumission (HTTP 200)" 200 $r.StatusCode
Check "Statut = EN_ATTENTE" "EN_ATTENTE" $r.Content.data.statut

# Re-soumission (conflit)
$r = Invoke-Api -Method POST -Url "$API/partenariats/$PARTENARIAT_ID/soumettre" -Token $TOKEN_ETAB
Check "Re-soumission (409)" 409 $r.StatusCode

# Modification apres soumission (interdit pour Etablissement)
$r = Invoke-Api -Method PATCH -Url "$API/partenariats/$PARTENARIAT_ID" -Token $TOKEN_ETAB -Body @{
    intitule = "Tentative apres soumission"
}
Check "Modification apres soumission par Etablissement (403)" 403 $r.StatusCode

# ============================================
# 8. ARCHIVAGE
# ============================================
Section "8. Archivage"

# Archivage par Etablissement (interdit)
$r = Invoke-Api -Method POST -Url "$API/partenariats/$PARTENARIAT_ID/archiver" -Token $TOKEN_ETAB
Check "Archivage par Etablissement (403)" 403 $r.StatusCode

# Archivage par Presidence (autorise)
$r = Invoke-Api -Method POST -Url "$API/partenariats/$PARTENARIAT_ID/archiver" -Token $TOKEN_PRES
Check "Archivage par Presidence (200)" 200 $r.StatusCode
Check "Archive = true" "true" "$($r.Content.data.archive)".ToLower()

# Detail apres archivage (404)
$r = Invoke-Api -Method GET -Url "$API/partenariats/$PARTENARIAT_ID" -Token $TOKEN_PRES
Check "Detail apres archivage (404)" 404 $r.StatusCode

# Visible dans la liste archive=true
$r = Invoke-Api -Method GET -Url "$API/partenariats?archive=true" -Token $TOKEN_PRES
$found = $r.Content.data.data | Where-Object { $_.id -eq $PARTENARIAT_ID }
if ($found) {
    Write-Host "[OK] Partenariat archive visible avec archive=true" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Partenariat archive non trouve avec archive=true" -ForegroundColor Red
    $script:TESTS_FAIL++
}

# ============================================
# 9. CAS D'ERREUR
# ============================================
Section "9. Cas d'erreur"

# Creation avec un etablissement inexistant
$r = Invoke-Api -Method POST -Url "$API/partenariats" -Token $TOKEN_PRES -Body @{
    intitule = "Test etablissement inexistant"
    domaine = "RECHERCHE"
    date_debut = "2026-01-01T00:00:00.000Z"
    etablissements_ids = @("11111111-1111-4111-8111-111111111111")
    partenaires_ids = @($PARTENAIRE_ID)
}
Check "Creation avec etablissement inexistant (404)" 404 $r.StatusCode

# Creation avec un partenaire inexistant
$r = Invoke-Api -Method POST -Url "$API/partenariats" -Token $TOKEN_PRES -Body @{
    intitule = "Test partenaire inexistant"
    domaine = "RECHERCHE"
    date_debut = "2026-01-01T00:00:00.000Z"
    etablissements_ids = @($ETAB_ID)
    partenaires_ids = @("11111111-1111-4111-8111-111111111111")
}
Check "Creation avec partenaire inexistant (404)" 404 $r.StatusCode

# Creation sans etablissement (400 - DTO invalide)
$r = Invoke-Api -Method POST -Url "$API/partenariats" -Token $TOKEN_PRES -Body @{
    intitule = "Test sans etablissement"
    domaine = "RECHERCHE"
    date_debut = "2026-01-01T00:00:00.000Z"
    partenaires_ids = @($PARTENAIRE_ID)
}
Check "Creation sans etablissement (400)" 400 $r.StatusCode

# ============================================
# RESUME
# ============================================
Section "RESUME"
$TOTAL = $script:TESTS_PASS + $script:TESTS_FAIL
Write-Host "Reussis : $script:TESTS_PASS" -ForegroundColor Green
Write-Host "Echoues : $script:TESTS_FAIL" -ForegroundColor Red
Write-Host "Total : $TOTAL"

if ($script:TESTS_FAIL -eq 0) {
    Write-Host "Tous les tests sont passes." -ForegroundColor Green
    exit 0
} else {
    Write-Host "$script:TESTS_FAIL test(s) en echec." -ForegroundColor Red
    exit 1
}