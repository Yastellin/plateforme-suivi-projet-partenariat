# test-projets.ps1
# Test complet du module Projets

$API = "http://localhost:3000/api"
$PASS = "password123"

# Dates de test calculees par rapport au jour courant : les jeux de donnees
# restent valides quelle que soit la date d'execution (regle « date de debut
# aujourd'hui ou posterieure »).
function DateIso {
    param([int]$Jours)
    $format = "yyyy-MM-ddTHH:mm:ss.fff"
    $jour = [datetime]::UtcNow.AddDays($Jours)
    return $jour.ToString($format, [System.Globalization.CultureInfo]::InvariantCulture) + "Z"
}

# Compteurs
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
    param(
        [string]$Method,
        [string]$Url,
        [string]$Token,
        [object]$Body
    )

    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    $params = @{
        Method = $Method
        Uri = $Url
        Headers = $headers
    }

    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10 -Compress)
    }

    try {
        $response = Invoke-WebRequest @params -UseBasicParsing
        return @{
            StatusCode = $response.StatusCode
            Content = $response.Content | ConvertFrom-Json
        }
    } catch {
        $statusCode = 0
        $content = $null
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $bodyText = $reader.ReadToEnd()
            try { $content = $bodyText | ConvertFrom-Json } catch { $content = $bodyText }
        }
        return @{
            StatusCode = $statusCode
            Content = $content
        }
    }
}

# ============================================
# 0. LOGIN
# ============================================
Section "0. Authentification"

$loginEtab = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "fds@univ-fianarantsoa.mg"
    mot_de_passe = $PASS
}
$TOKEN_ETAB = $loginEtab.Content.data.access_token

$loginPres = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "presidence@univ-fianarantsoa.mg"
    mot_de_passe = $PASS
}
$TOKEN_PRES = $loginPres.Content.data.access_token

$loginDec = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "president@univ-fianarantsoa.mg"
    mot_de_passe = $PASS
}
$TOKEN_DEC = $loginDec.Content.data.access_token

if (-not $TOKEN_ETAB) {
    Write-Host "Echec de login ETABLISSEMENT" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Login ETABLISSEMENT" -ForegroundColor Green
Write-Host "[OK] Login PRESIDENCE" -ForegroundColor Green
Write-Host "[OK] Login DECIDEUR" -ForegroundColor Green

# Recuperer l'ID de l'etablissement
$me = Invoke-Api -Method GET -Url "$API/auth/me" -Token $TOKEN_ETAB
$ETAB_ID = $me.Content.data.etablissement_id
Write-Host "ID ETABLISSEMENT FDS : $ETAB_ID"

# ============================================
# 1. CREATION D'UN PROJET
# ============================================
Section "1. Creation d'un projet"

$resp = Invoke-Api -Method POST -Url "$API/projets" -Token $TOKEN_ETAB -Body @{
    nom = "Projet Test Complet"
    intitule_officiel = "Test complet du module Projets"
    type = "Recherche"
    domaine = "Informatique"
    budget = 15000
    date_debut = (DateIso 60)
    date_fin_prevue = (DateIso 500)
}

Check "Creation projet (HTTP)" 201 $resp.StatusCode
$PROJET_ID = $resp.Content.data.id
Check "Statut = BROUILLON" "BROUILLON" $resp.Content.data.statut
Check "Avancement = 0" 0 $resp.Content.data.avancement
Check "En retard = false" "false" "$($resp.Content.data.en_retard)".ToLower()
Write-Host "ID PROJET : $PROJET_ID"

# ============================================
# 2. LISTE ET FILTRES
# ============================================
Section "2. Liste et filtres"

$r = Invoke-Api -Method GET -Url "$API/projets" -Token $TOKEN_ETAB
Check "Liste projets" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/projets?statut=BROUILLON" -Token $TOKEN_ETAB
Check "Filtre statut=BROUILLON" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/projets?type=Recherche" -Token $TOKEN_ETAB
Check "Filtre type=Recherche" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/projets?page=1&limit=5" -Token $TOKEN_ETAB
Check "Pagination" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/projets?archive=true" -Token $TOKEN_ETAB
Check "Filtre archive=true" 200 $r.StatusCode

# ============================================
# 3. DETAIL
# ============================================
Section "3. Detail d'un projet"

$r = Invoke-Api -Method GET -Url "$API/projets/$PROJET_ID" -Token $TOKEN_ETAB
Check "GET /projets/:id" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/projets/00000000-0000-0000-0000-000000000000" -Token $TOKEN_ETAB
Check "GET inexistant (404)" 404 $r.StatusCode

# ============================================
# 4. MODIFICATION
# ============================================
Section "4. Modification (brouillon)"

$r = Invoke-Api -Method PATCH -Url "$API/projets/$PROJET_ID" -Token $TOKEN_ETAB -Body @{
    nom = "Projet Test Complet v2"
    budget = 25000
    domaine = "Intelligence Artificielle"
}
Check "Modification (HTTP)" 200 $r.StatusCode
Check "Nom modifie" "Projet Test Complet v2" $r.Content.data.nom
Check "Statut reste BROUILLON" "BROUILLON" $r.Content.data.statut

# ============================================
# 5. AVANCEMENT
# ============================================
Section "5. Avancement"

$r = Invoke-Api -Method GET -Url "$API/projets/$PROJET_ID/avancement" -Token $TOKEN_ETAB
Check "Avancement = 0" 0 $r.Content.data.avancement
Check "Activites totales = 0" 0 $r.Content.data.activites_total
Check "Activites terminees = 0" 0 $r.Content.data.activites_terminees

# ============================================
# 6. CREATION AVEC PARTENARIAT
# ============================================
Section "6. Creation avec partenariat"

$rPart = Invoke-Api -Method GET -Url "$API/partenariats" -Token $TOKEN_ETAB
if ($rPart.Content.data.data.Count -gt 0) {
    $PARTENARIAT_ID = $rPart.Content.data.data[0].id
    $r = Invoke-Api -Method POST -Url "$API/projets" -Token $TOKEN_ETAB -Body @{
        nom = "Projet lie a un partenariat"
        type = "Recherche"
        date_debut = (DateIso 60)
        date_fin_prevue = (DateIso 500)
        partenariat_id = $PARTENARIAT_ID
    }
    Check "Creation avec partenariat" 201 $r.StatusCode
} else {
    Write-Host "[SKIP] Aucun partenariat disponible" -ForegroundColor Yellow
}

# ============================================
# 7. CREATION AVEC PARTENAIRES PROPRES
# ============================================
Section "7. Creation avec partenaires propres"

$rPart = Invoke-Api -Method GET -Url "$API/partenaires" -Token $TOKEN_ETAB
$PROJET_2_ID = $null
if ($rPart.Content.data.data.Count -gt 0) {
    $PARTENAIRE_ID = $rPart.Content.data.data[0].id
    $r = Invoke-Api -Method POST -Url "$API/projets" -Token $TOKEN_ETAB -Body @{
        nom = "Projet avec partenaires propres"
        type = "Recherche"
        date_debut = (DateIso 60)
        date_fin_prevue = (DateIso 500)
        partenaires_ids = @($PARTENAIRE_ID)
    }
    Check "Creation avec partenaires propres" 201 $r.StatusCode
    if ($r.Content.data) {
        $PROJET_2_ID = $r.Content.data.id
    }
} else {
    Write-Host "[SKIP] Aucun partenaire disponible" -ForegroundColor Yellow
}

# ============================================
# 8. PRESIDENCE
# ============================================
Section "8. Tests PRESIDENCE"

$r = Invoke-Api -Method GET -Url "$API/projets" -Token $TOKEN_PRES
Check "Liste tous les projets" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/projets/$PROJET_ID" -Token $TOKEN_PRES
Check "Detail projet (Presidence)" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/projets?etablissement_id=$ETAB_ID" -Token $TOKEN_PRES
Check "Filtre par etablissement" 200 $r.StatusCode

# ============================================
# 9. SOUMISSION
# ============================================
Section "9. Soumission"

$r = Invoke-Api -Method POST -Url "$API/projets/$PROJET_ID/soumettre" -Token $TOKEN_ETAB
Check "Soumission (HTTP 200)" 200 $r.StatusCode
Check "Statut = EN_ATTENTE" "EN_ATTENTE" $r.Content.data.statut

$r = Invoke-Api -Method POST -Url "$API/projets/$PROJET_ID/soumettre" -Token $TOKEN_ETAB
Check "Re-soumission (409)" 409 $r.StatusCode

$r = Invoke-Api -Method PATCH -Url "$API/projets/$PROJET_ID" -Token $TOKEN_ETAB -Body @{
    nom = "Tentative apres soumission"
}
Check "Modification apres soumission (403)" 403 $r.StatusCode

# ============================================
# 10. DECIDEUR
# ============================================
Section "10. Tests DECIDEUR"

$r = Invoke-Api -Method GET -Url "$API/projets" -Token $TOKEN_DEC
Check "Liste projets (Decideur)" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/projets/$PROJET_ID" -Token $TOKEN_DEC
Check "Detail (Decideur)" 200 $r.StatusCode

$r = Invoke-Api -Method POST -Url "$API/projets" -Token $TOKEN_DEC -Body @{
    nom = "Interdit"
    type = "Test"
    date_debut = (DateIso 60)
    date_fin_prevue = (DateIso 500)
}
Check "Creation interdite (403)" 403 $r.StatusCode

$r = Invoke-Api -Method PATCH -Url "$API/projets/$PROJET_ID" -Token $TOKEN_DEC -Body @{
    nom = "Interdit"
}
Check "Modification interdite (403)" 403 $r.StatusCode

# ============================================
# 11. ARCHIVAGE
# ============================================
Section "11. Archivage"

if ($PROJET_2_ID) {
    $r = Invoke-Api -Method POST -Url "$API/projets/$PROJET_2_ID/archiver" -Token $TOKEN_PRES
    Check "Archivage par Presidence (200)" 200 $r.StatusCode
    Check "Archive = true" "true" "$($r.Content.data.archive)".ToLower()

    $r = Invoke-Api -Method GET -Url "$API/projets/$PROJET_2_ID" -Token $TOKEN_PRES
    Check "Detail apres archivage (404)" 404 $r.StatusCode

    $r = Invoke-Api -Method GET -Url "$API/projets?archive=true" -Token $TOKEN_PRES
    $found = $r.Content.data.data | Where-Object { $_.id -eq $PROJET_2_ID }
    if ($found) {
        Write-Host "[OK] Projet archive visible dans la liste archive=true" -ForegroundColor Green
        $script:TESTS_PASS++
    } else {
        Write-Host "[ECHEC] Projet archive non trouve dans la liste archive=true" -ForegroundColor Red
        $script:TESTS_FAIL++
    }
} else {
    Write-Host "[SKIP] Pas de PROJET_2_ID pour tester l'archivage" -ForegroundColor Yellow
}

# Archivage par Etablissement (doit etre refuse)
$r = Invoke-Api -Method POST -Url "$API/projets/$PROJET_ID/archiver" -Token $TOKEN_ETAB
Check "Archivage par Etablissement (403)" 403 $r.StatusCode

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