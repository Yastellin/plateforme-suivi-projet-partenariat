# test-partenaires.ps1
# Test complet du module Partenaires (entites + contacts)

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
        $statusCode = 0; $content = $null
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            try { $content = $_.ErrorDetails.Message | ConvertFrom-Json } catch { $content = $_.ErrorDetails.Message }
        } elseif ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        if (-not $statusCode -and $_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        return @{ StatusCode = $statusCode; Content = $content }
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
# 1. CREATION D'UN PARTENAIRE
# ============================================
Section "1. Creation d'un partenaire"

$nomUnique = "Partenaire Test " + (Get-Date -Format "yyyyMMddHHmmss")

$r = Invoke-Api -Method POST -Url "$API/partenaires" -Token $TOKEN_ETAB -Body @{
    nom = $nomUnique
    type = "Universite"
    pays = "France"
    adresse = "Toulouse, France"
    telephone = "+33 5 61 55 66 77"
    email = "test@univ-test.fr"
    site_web = "https://www.univ-test.fr"
    description = "Partenaire de test"
    statut = "ACTIF"
    visibilite = "PUBLIC"
    est_strategique = $false
}
Check "Creation partenaire (201)" 201 $r.StatusCode
$PARTENAIRE_ID = $r.Content.data.id
Check "Nom correct" $nomUnique $r.Content.data.nom
Check "Type correct" "Universite" $r.Content.data.type
Check "Pays correct" "France" $r.Content.data.pays
Check "Statut ACTIF" "ACTIF" $r.Content.data.statut
Check "Visibilite PUBLIC" "PUBLIC" $r.Content.data.visibilite
Check "Archive = false" "false" "$($r.Content.data.archive)".ToLower()
Write-Host "PARTENAIRE ID : $PARTENAIRE_ID"

# ============================================
# 2. LISTE + FILTRES
# ============================================
Section "2. Liste et filtres"

$r = Invoke-Api -Method GET -Url "$API/partenaires" -Token $TOKEN_ETAB
Check "Liste partenaires (200)" 200 $r.StatusCode
Check "Pagination presente" $true ($null -ne $r.Content.data.meta)

$r = Invoke-Api -Method GET -Url "$API/partenaires?nom=Test" -Token $TOKEN_ETAB
Check "Filtre nom=Test (200)" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/partenaires?type=Universite" -Token $TOKEN_ETAB
Check "Filtre type=Universite (200)" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/partenaires?pays=France" -Token $TOKEN_ETAB
Check "Filtre pays=France (200)" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/partenaires?statut=ACTIF" -Token $TOKEN_ETAB
Check "Filtre statut=ACTIF (200)" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/partenaires?page=1&limit=5" -Token $TOKEN_ETAB
Check "Pagination (200)" 200 $r.StatusCode

# ============================================
# 3. DETAIL
# ============================================
Section "3. Detail d'un partenaire"

$r = Invoke-Api -Method GET -Url "$API/partenaires/$PARTENAIRE_ID" -Token $TOKEN_ETAB
Check "GET /partenaires/:id (200)" 200 $r.StatusCode
Check "Nom correct" $nomUnique $r.Content.data.nom
Check "Contacts presents" $true ($null -ne $r.Content.data.contacts)

$r = Invoke-Api -Method GET -Url "$API/partenaires/00000000-0000-0000-0000-000000000000" -Token $TOKEN_ETAB
Check "GET inexistant (404)" 404 $r.StatusCode

# ============================================
# 4. MODIFICATION
# ============================================
Section "4. Modification"

$r = Invoke-Api -Method PATCH -Url "$API/partenaires/$PARTENAIRE_ID" -Token $TOKEN_ETAB -Body @{
    type = "Institut"
    description = "Description modifiee"
    est_strategique = $true
}
Check "Modification (200)" 200 $r.StatusCode
Check "Type modifie" "Institut" $r.Content.data.type
Check "Description modifiee" "Description modifiee" $r.Content.data.description
Check "Est strategique" "true" "$($r.Content.data.est_strategique)".ToLower()

# ============================================
# 5. RECHERCHE DE DOUBLON
# ============================================
Section "5. Recherche de doublon"

$r = Invoke-Api -Method GET -Url "$API/partenaires/recherche-doublon?nom=$nomUnique" -Token $TOKEN_ETAB
Check "Recherche doublon (200)" 200 $r.StatusCode
if ($r.Content.data) {
    Check "Doublon trouve" $PARTENAIRE_ID $r.Content.data.id
} else {
    Write-Host "[ECHEC] Doublon non trouve" -ForegroundColor Red
    $script:TESTS_FAIL++
}

# ============================================
# 6. GESTION DES CONTACTS
# ============================================
Section "6. Gestion des contacts"

$r = Invoke-Api -Method POST -Url "$API/partenaires/$PARTENAIRE_ID/contacts" -Token $TOKEN_ETAB -Body @{
    nom = "Prof. Dupont"
    fonction = "Directeur"
    email = "dupont@univ-test.fr"
    telephone = "+33 1 23 45 67 89"
}
Check "Creation contact (201)" 201 $r.StatusCode
$CONTACT_ID = $r.Content.data.id
Check "Nom contact correct" "Prof. Dupont" $r.Content.data.nom

$r = Invoke-Api -Method PATCH -Url "$API/contacts/$CONTACT_ID" -Token $TOKEN_ETAB -Body @{
    fonction = "Directeur General"
}
Check "Modification contact (200)" 200 $r.StatusCode
Check "Fonction modifiee" "Directeur General" $r.Content.data.fonction

# ============================================
# 7. PERMISSIONS
# ============================================
Section "7. Permissions"

# Decideur peut lire
$r = Invoke-Api -Method GET -Url "$API/partenaires" -Token $TOKEN_DEC
Check "Lecture par Decideur (200)" 200 $r.StatusCode

# Decideur ne peut pas creer
$r = Invoke-Api -Method POST -Url "$API/partenaires" -Token $TOKEN_DEC -Body @{
    nom = "Interdit"
    type = "Test"
    pays = "Madagascar"
}
Check "Creation par Decideur (403)" 403 $r.StatusCode

# Decideur ne peut pas modifier
$r = Invoke-Api -Method PATCH -Url "$API/partenaires/$PARTENAIRE_ID" -Token $TOKEN_DEC -Body @{
    nom = "Interdit"
}
Check "Modification par Decideur (403)" 403 $r.StatusCode

# ============================================
# 8. CAS D'ERREUR
# ============================================
Section "8. Cas d'erreur"

# Creation avec nom duplique
$r = Invoke-Api -Method POST -Url "$API/partenaires" -Token $TOKEN_ETAB -Body @{
    nom = $nomUnique
    type = "Test"
    pays = "Madagascar"
}
Check "Nom duplique (409)" 409 $r.StatusCode

# ============================================
# 9. ARCHIVAGE
# ============================================
Section "9. Archivage"

# Archivage par Etablissement (interdit)
$r = Invoke-Api -Method POST -Url "$API/partenaires/$PARTENAIRE_ID/archiver" -Token $TOKEN_ETAB
Check "Archivage par Etablissement (403)" 403 $r.StatusCode

# Archivage par Presidence (autorise)
$r = Invoke-Api -Method POST -Url "$API/partenaires/$PARTENAIRE_ID/archiver" -Token $TOKEN_PRES
Check "Archivage par Presidence (200)" 200 $r.StatusCode
Check "Archive = true" "true" "$($r.Content.data.archive)".ToLower()

# Detail apres archivage (404)
$r = Invoke-Api -Method GET -Url "$API/partenaires/$PARTENAIRE_ID" -Token $TOKEN_PRES
Check "Detail apres archivage (404)" 404 $r.StatusCode

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