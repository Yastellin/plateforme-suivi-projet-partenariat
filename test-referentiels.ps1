# test-referentiels.ps1
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
    $params = @{ Method = $Method; Uri = $Url; Headers = $headers }
    if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 10 -Compress) }
    try {
        $response = Invoke-WebRequest @params -UseBasicParsing
        return @{ StatusCode = $response.StatusCode; Content = $response.Content | ConvertFrom-Json }
    } catch {
        $statusCode = 0; $content = $null
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $bodyText = $reader.ReadToEnd()
            try { $content = $bodyText | ConvertFrom-Json } catch { $content = $bodyText }
        }
        return @{ StatusCode = $statusCode; Content = $content }
    }
}

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
# PORTOIRS
# ============================================
Section "1. Porteurs"

$r = Invoke-Api -Method POST -Url "$API/referentiels/porteurs" -Token $TOKEN_PRES -Body @{
    nom = "Dr. Test Porteur"
    institution_rattachement = "FDS"
}
Check "Creer porteur (201)" 201 $r.StatusCode
$PORTEUR_ID = $r.Content.data.id
Check "Nom du porteur" "Dr. Test Porteur" $r.Content.data.nom
Write-Host "PORTEUR ID : $PORTEUR_ID"

$r = Invoke-Api -Method GET -Url "$API/referentiels/porteurs" -Token $TOKEN_PRES
Check "Lister porteurs" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/referentiels/porteurs?nom=Test" -Token $TOKEN_PRES
Check "Filtre nom" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/referentiels/porteurs/$PORTEUR_ID" -Token $TOKEN_PRES
Check "Detail porteur" 200 $r.StatusCode

$r = Invoke-Api -Method PATCH -Url "$API/referentiels/porteurs/$PORTEUR_ID" -Token $TOKEN_PRES -Body @{
    institution_rattachement = "FLSH"
}
Check "Modifier porteur" 200 $r.StatusCode
Check "Institution modifiee" "FLSH" $r.Content.data.institution_rattachement

# Doublon
$r = Invoke-Api -Method POST -Url "$API/referentiels/porteurs" -Token $TOKEN_PRES -Body @{
    nom = "Dr. Test Porteur"
}
Check "Doublon porteur (409)" 409 $r.StatusCode

# Permissions
$r = Invoke-Api -Method POST -Url "$API/referentiels/porteurs" -Token $TOKEN_ETAB -Body @{
    nom = "Interdit"
}
Check "Creation par Etablissement (403)" 403 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/referentiels/porteurs" -Token $TOKEN_ETAB
Check "Lecture par Etablissement (200)" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/referentiels/porteurs" -Token $TOKEN_DEC
Check "Lecture par Decideur (200)" 200 $r.StatusCode

$r = Invoke-Api -Method DELETE -Url "$API/referentiels/porteurs/$PORTEUR_ID" -Token $TOKEN_PRES
Check "Supprimer porteur (200)" 200 $r.StatusCode

# ============================================
# BAILLEURS
# ============================================
Section "2. Bailleurs"

$r = Invoke-Api -Method POST -Url "$API/referentiels/bailleurs" -Token $TOKEN_PRES -Body @{
    nom = "Bailleur Test"
    description = "Description du bailleur"
}
Check "Creer bailleur (201)" 201 $r.StatusCode
$BAILLEUR_ID = $r.Content.data.id
Write-Host "BAILLEUR ID : $BAILLEUR_ID"

$r = Invoke-Api -Method GET -Url "$API/referentiels/bailleurs" -Token $TOKEN_PRES
Check "Lister bailleurs" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/referentiels/bailleurs/$BAILLEUR_ID" -Token $TOKEN_PRES
Check "Detail bailleur" 200 $r.StatusCode

$r = Invoke-Api -Method PATCH -Url "$API/referentiels/bailleurs/$BAILLEUR_ID" -Token $TOKEN_PRES -Body @{
    description = "Description modifiee"
}
Check "Modifier bailleur" 200 $r.StatusCode

$r = Invoke-Api -Method DELETE -Url "$API/referentiels/bailleurs/$BAILLEUR_ID" -Token $TOKEN_PRES
Check "Supprimer bailleur (200)" 200 $r.StatusCode

# ============================================
# BENEFICIAIRES
# ============================================
Section "3. Beneficiaires"

$r = Invoke-Api -Method POST -Url "$API/referentiels/beneficiaires" -Token $TOKEN_PRES -Body @{
    nom = "Beneficiaire Test"
    categorie = "Etudiants"
    description = "Description beneficiaire"
}
Check "Creer beneficiaire (201)" 201 $r.StatusCode
$BENEFICIAIRE_ID = $r.Content.data.id
Check "Categorie" "Etudiants" $r.Content.data.categorie
Write-Host "BENEFICIAIRE ID : $BENEFICIAIRE_ID"

$r = Invoke-Api -Method GET -Url "$API/referentiels/beneficiaires" -Token $TOKEN_PRES
Check "Lister beneficiaires" 200 $r.StatusCode

$r = Invoke-Api -Method PATCH -Url "$API/referentiels/beneficiaires/$BENEFICIAIRE_ID" -Token $TOKEN_PRES -Body @{
    categorie = "Enseignants"
}
Check "Modifier beneficiaire" 200 $r.StatusCode
Check "Categorie modifiee" "Enseignants" $r.Content.data.categorie

$r = Invoke-Api -Method DELETE -Url "$API/referentiels/beneficiaires/$BENEFICIAIRE_ID" -Token $TOKEN_PRES
Check "Supprimer beneficiaire (200)" 200 $r.StatusCode

# ============================================
# SITES
# ============================================
Section "4. Sites"

$r = Invoke-Api -Method POST -Url "$API/referentiels/sites" -Token $TOKEN_PRES -Body @{
    nom = "Site Test"
    description = "Description du site"
}
Check "Creer site (201)" 201 $r.StatusCode
$SITE_ID = $r.Content.data.id
Write-Host "SITE ID : $SITE_ID"

$r = Invoke-Api -Method GET -Url "$API/referentiels/sites" -Token $TOKEN_PRES
Check "Lister sites" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/referentiels/sites?nom=Test" -Token $TOKEN_PRES
Check "Filtre sites par nom" 200 $r.StatusCode

$r = Invoke-Api -Method PATCH -Url "$API/referentiels/sites/$SITE_ID" -Token $TOKEN_PRES -Body @{
    description = "Description modifiee"
}
Check "Modifier site" 200 $r.StatusCode

$r = Invoke-Api -Method DELETE -Url "$API/referentiels/sites/$SITE_ID" -Token $TOKEN_PRES
Check "Supprimer site (200)" 200 $r.StatusCode

# ============================================
# CAS D'ERREUR
# ============================================
Section "5. Cas d'erreur"

$r = Invoke-Api -Method GET -Url "$API/referentiels/porteurs/00000000-0000-0000-0000-000000000000" -Token $TOKEN_PRES
Check "GET porteur inexistant (404)" 404 $r.StatusCode

$r = Invoke-Api -Method DELETE -Url "$API/referentiels/porteurs/00000000-0000-0000-0000-000000000000" -Token $TOKEN_PRES
Check "DELETE porteur inexistant (404)" 404 $r.StatusCode

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