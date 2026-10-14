# test-cotutelles.ps1
# Test complet du module Cotutelles

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
# 1. RECUPERER LES IDS NECESSAIRES
# ============================================
Section "1. Recuperation des IDs"

$rEtab = Invoke-Api -Method GET -Url "$API/etablissements" -Token $TOKEN_PRES
$ETAB_ID = $rEtab.Content.data.data[0].id
Write-Host "ETABLISSEMENT ID : $ETAB_ID"

$rPart = Invoke-Api -Method GET -Url "$API/partenaires" -Token $TOKEN_PRES
$PARTENAIRE_ID = $rPart.Content.data.data[0].id
Write-Host "PARTENAIRE ID : $PARTENAIRE_ID"

# ============================================
# 2. CREATION D'UNE COTUTELLE
# ============================================
Section "2. Creation d'une cotutelle"

$r = Invoke-Api -Method POST -Url "$API/cotutelles" -Token $TOKEN_PRES -Body @{
    nom_doctorant = "Rakoto Andry"
    specialite = "Biologie marine"
    directeur_these_local = "Pr. Rasoa Hery"
    directeur_these_partenaire = "Pr. Dupont Marie"
    type = "COTUTELLE"
    date_debut = (DateIso 60)
    date_prevue_soutenance = (DateIso 1500)
    financement_bourse = "Bourse SCAC 2026"
    etat_avancement = "Premiere annee en cours"
    etablissement_id = $ETAB_ID
    partenaire_id = $PARTENAIRE_ID
}
Check "Creation cotutelle (HTTP 201)" 201 $r.StatusCode
$COTUTELLE_ID = $r.Content.data.id
Check "nom_doctorant" "Rakoto Andry" $r.Content.data.nom_doctorant
Check "type" "COTUTELLE" $r.Content.data.type
Check "archive = false" "false" "$($r.Content.data.archive)".ToLower()
Write-Host "COTUTELLE ID : $COTUTELLE_ID"

# ============================================
# 3. LISTE + FILTRES
# ============================================
Section "3. Liste et filtres"

$r = Invoke-Api -Method GET -Url "$API/cotutelles" -Token $TOKEN_PRES
Check "Liste cotutelles" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/cotutelles?type=COTUTELLE" -Token $TOKEN_PRES
Check "Filtre type=COTUTELLE" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/cotutelles?nom_doctorant=Rakoto" -Token $TOKEN_PRES
Check "Filtre nom_doctorant=Rakoto" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/cotutelles?page=1&limit=5" -Token $TOKEN_PRES
Check "Pagination" 200 $r.StatusCode

# ============================================
# 4. DETAIL
# ============================================
Section "4. Detail"

$r = Invoke-Api -Method GET -Url "$API/cotutelles/$COTUTELLE_ID" -Token $TOKEN_PRES
Check "GET /cotutelles/:id" 200 $r.StatusCode
Check "Detail nom_doctorant" "Rakoto Andry" $r.Content.data.nom_doctorant

$r = Invoke-Api -Method GET -Url "$API/cotutelles/00000000-0000-0000-0000-000000000000" -Token $TOKEN_PRES
Check "GET inexistant (404)" 404 $r.StatusCode

# ============================================
# 5. MODIFICATION
# ============================================
Section "5. Modification"

$r = Invoke-Api -Method PATCH -Url "$API/cotutelles/$COTUTELLE_ID" -Token $TOKEN_PRES -Body @{
    etat_avancement = "Deuxieme annee, en cours de redaction"
    mobilite_realisee = "Un sejour de 6 mois a Toulouse"
    publications_produites = "1 article publie"
}
Check "Modification (HTTP 200)" 200 $r.StatusCode
Check "etat_avancement modifie" "Deuxieme annee, en cours de redaction" $r.Content.data.etat_avancement
Check "mobilite_realisee" "Un sejour de 6 mois a Toulouse" $r.Content.data.mobilite_realisee

# ============================================
# 6. PERMISSIONS
# ============================================
Section "6. Permissions"

# Etablissement ne peut pas creer
$r = Invoke-Api -Method POST -Url "$API/cotutelles" -Token $TOKEN_ETAB -Body @{
    nom_doctorant = "Test interdit"
    type = "COTUTELLE"
    date_debut = (DateIso 60)
    etablissement_id = $ETAB_ID
    partenaire_id = $PARTENAIRE_ID
}
Check "Creation par Etablissement (403)" 403 $r.StatusCode

# Etablissement ne peut pas modifier
$r = Invoke-Api -Method PATCH -Url "$API/cotutelles/$COTUTELLE_ID" -Token $TOKEN_ETAB -Body @{
    etat_avancement = "Interdit"
}
Check "Modification par Etablissement (403)" 403 $r.StatusCode

# Decideur ne peut pas creer
$r = Invoke-Api -Method POST -Url "$API/cotutelles" -Token $TOKEN_DEC -Body @{
    nom_doctorant = "Test interdit"
    type = "COTUTELLE"
    date_debut = (DateIso 60)
    etablissement_id = $ETAB_ID
    partenaire_id = $PARTENAIRE_ID
}
Check "Creation par Decideur (403)" 403 $r.StatusCode

# Decideur peut lire
$r = Invoke-Api -Method GET -Url "$API/cotutelles" -Token $TOKEN_DEC
Check "Lecture par Decideur (200)" 200 $r.StatusCode

# Decideur peut lire le detail
$r = Invoke-Api -Method GET -Url "$API/cotutelles/$COTUTELLE_ID" -Token $TOKEN_DEC
Check "Detail par Decideur (200)" 200 $r.StatusCode

# ============================================
# 7. ARCHIVAGE
# ============================================
Section "7. Archivage"

$r = Invoke-Api -Method POST -Url "$API/cotutelles/$COTUTELLE_ID/archiver" -Token $TOKEN_PRES
Check "Archivage par Presidence (200)" 200 $r.StatusCode
Check "archive = true" "true" "$($r.Content.data.archive)".ToLower()

$r = Invoke-Api -Method GET -Url "$API/cotutelles/$COTUTELLE_ID" -Token $TOKEN_PRES
Check "Detail apres archivage (404)" 404 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/cotutelles?archive=true" -Token $TOKEN_PRES
$found = $r.Content.data.data | Where-Object { $_.id -eq $COTUTELLE_ID }
if ($found) {
    Write-Host "[OK] Cotutelle archivee visible avec archive=true" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Cotutelle archivee non trouvee avec archive=true" -ForegroundColor Red
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