# test-conventions.ps1
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
# 1. RECUPERATION DES IDS
# ============================================
Section "1. Recuperation des IDs"

$rPart = Invoke-Api -Method GET -Url "$API/partenariats" -Token $TOKEN_PRES
$PARTENARIAT_ID = $rPart.Content.data.data[0].id
Write-Host "PARTENARIAT ID : $PARTENARIAT_ID"

$rProjets = Invoke-Api -Method GET -Url "$API/projets" -Token $TOKEN_PRES
$PROJET_ID = $rProjets.Content.data.data[0].id
Write-Host "PROJET ID : $PROJET_ID"

# ============================================
# 2. CREATION D'UNE CONVENTION
# ============================================
Section "2. Creation d'une convention"

$REF = "CONV-TEST-" + (Get-Date -Format "yyyyMMddHHmmss")
$r = Invoke-Api -Method POST -Url "$API/conventions" -Token $TOKEN_PRES -Body @{
    reference = $REF
    titre = "Convention de test"
    date_debut = (DateIso 60)
    date_fin = (DateIso 1500)
    statut = "BROUILLON"
    description = "Convention de test pour validation"
    partenariat_id = $PARTENARIAT_ID
}
Check "Creation convention (201)" 201 $r.StatusCode
$CONVENTION_ID = $r.Content.data.id
Check "reference" $REF $r.Content.data.reference
Check "statut BROUILLON" "BROUILLON" $r.Content.data.statut
Check "archive = false" "false" "$($r.Content.data.archive)".ToLower()
Write-Host "CONVENTION ID : $CONVENTION_ID"

# ============================================
# 3. LISTE + FILTRES
# ============================================
Section "3. Liste et filtres"

$r = Invoke-Api -Method GET -Url "$API/conventions" -Token $TOKEN_PRES
Check "Liste conventions" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/conventions?statut=BROUILLON" -Token $TOKEN_PRES
Check "Filtre statut=BROUILLON" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/conventions?partenariat_id=$PARTENARIAT_ID" -Token $TOKEN_PRES
Check "Filtre par partenariat" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/conventions?page=1&limit=5" -Token $TOKEN_PRES
Check "Pagination" 200 $r.StatusCode

# ============================================
# 4. DETAIL
# ============================================
Section "4. Detail"

$r = Invoke-Api -Method GET -Url "$API/conventions/$CONVENTION_ID" -Token $TOKEN_PRES
Check "GET /conventions/:id" 200 $r.StatusCode
Check "Titre" "Convention de test" $r.Content.data.titre

$r = Invoke-Api -Method GET -Url "$API/conventions/00000000-0000-0000-0000-000000000000" -Token $TOKEN_PRES
Check "GET inexistant (404)" 404 $r.StatusCode

# ============================================
# 5. MODIFICATION
# ============================================
Section "5. Modification"

$r = Invoke-Api -Method PATCH -Url "$API/conventions/$CONVENTION_ID" -Token $TOKEN_PRES -Body @{
    statut = "SIGNEE"
    date_signature = "2026-01-20T00:00:00.000Z"
    description = "Convention signee le 20 janvier 2026"
}
Check "Modification (200)" 200 $r.StatusCode
Check "statut = SIGNEE" "SIGNEE" $r.Content.data.statut
Check "description modifiee" "Convention signee le 20 janvier 2026" $r.Content.data.description

# ============================================
# 6. PERMISSIONS
# ============================================
Section "6. Permissions"

# Etablissement ne peut pas creer
$r = Invoke-Api -Method POST -Url "$API/conventions" -Token $TOKEN_ETAB -Body @{
    reference = "CONV-INTERDIT"
    titre = "Interdit"
    partenariat_id = $PARTENARIAT_ID
}
Check "Creation par Etablissement (403)" 403 $r.StatusCode

# Etablissement ne peut pas lire
$r = Invoke-Api -Method GET -Url "$API/conventions" -Token $TOKEN_ETAB
Check "Lecture par Etablissement (403)" 403 $r.StatusCode

# Decideur peut lire
$r = Invoke-Api -Method GET -Url "$API/conventions" -Token $TOKEN_DEC
Check "Lecture par Decideur (200)" 200 $r.StatusCode

# Decideur ne peut pas creer
$r = Invoke-Api -Method POST -Url "$API/conventions" -Token $TOKEN_DEC -Body @{
    reference = "CONV-INTERDIT-2"
    titre = "Interdit"
    partenariat_id = $PARTENARIAT_ID
}
Check "Creation par Decideur (403)" 403 $r.StatusCode

# ============================================
# 7. REFERENCE UNIQUE
# ============================================
Section "7. Reference unique"

$r = Invoke-Api -Method POST -Url "$API/conventions" -Token $TOKEN_PRES -Body @{
    reference = $REF
    titre = "Doublon"
    partenariat_id = $PARTENARIAT_ID
}
Check "Reference en doublon (409)" 409 $r.StatusCode

# ============================================
# 8. ARCHIVAGE
# ============================================
Section "8. Archivage"

$r = Invoke-Api -Method POST -Url "$API/conventions/$CONVENTION_ID/archiver" -Token $TOKEN_PRES
Check "Archivage (200)" 200 $r.StatusCode
Check "archive = true" "true" "$($r.Content.data.archive)".ToLower()

$r = Invoke-Api -Method GET -Url "$API/conventions/$CONVENTION_ID" -Token $TOKEN_PRES
Check "Detail apres archivage (404)" 404 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/conventions?archive=true" -Token $TOKEN_PRES
$found = $r.Content.data.data | Where-Object { $_.id -eq $CONVENTION_ID }
if ($found) {
    Write-Host "[OK] Convention archivee visible avec archive=true" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Convention archivee non trouvee avec archive=true" -ForegroundColor Red
    $script:TESTS_FAIL++
}

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