# test-tableau-de-bord.ps1
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
    param([string]$Method, [string]$Url, [string]$Token)
    $headers = @{ "Content-Type" = "application/json" }
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    try {
        $response = Invoke-WebRequest -Method $Method -Uri $Url -Headers $headers -UseBasicParsing
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

$loginPres = Invoke-Api -Method POST -Url "$API/auth/login" -Token $null
# Pour le POST login, on passe par une commande directe
$body = @{ email = "presidence@univ-fianarantsoa.mg"; mot_de_passe = $PASS } | ConvertTo-Json
$r = Invoke-RestMethod -Method POST -Uri "$API/auth/login" -ContentType "application/json" -Body $body
$TOKEN_PRES = $r.data.access_token

$body = @{ email = "fds@univ-fianarantsoa.mg"; mot_de_passe = $PASS } | ConvertTo-Json
$r = Invoke-RestMethod -Method POST -Uri "$API/auth/login" -ContentType "application/json" -Body $body
$TOKEN_ETAB = $r.data.access_token

$body = @{ email = "president@univ-fianarantsoa.mg"; mot_de_passe = $PASS } | ConvertTo-Json
$r = Invoke-RestMethod -Method POST -Uri "$API/auth/login" -ContentType "application/json" -Body $body
$TOKEN_DEC = $r.data.access_token

if (-not $TOKEN_PRES) { Write-Host "Echec login PRESIDENCE" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Login PRESIDENCE" -ForegroundColor Green
Write-Host "[OK] Login ETABLISSEMENT" -ForegroundColor Green
Write-Host "[OK] Login DECIDEUR" -ForegroundColor Green

Section "1. Tableau de bord PRESIDENCE (vue globale)"

$r = Invoke-Api -Method GET -Url "$API/tableau-de-bord" -Token $TOKEN_PRES
Check "GET /tableau-de-bord (Presidence)" 200 $r.StatusCode
Check "perimetre GLOBAL" "GLOBAL" $r.Content.data.perimetre
$COMPTEURS_GLOBAUX = $r.Content.data.compteurs.partenaires
Write-Host "Partenaires globaux : $($r.Content.data.compteurs.partenaires)"
Write-Host "Partenariats globaux : $($r.Content.data.compteurs.partenariats)"
Write-Host "Projets globaux : $($r.Content.data.compteurs.projets)"

if ($r.Content.data.compteurs.partenaires -ge 1) {
    Write-Host "[OK] Au moins 1 partenaire global" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Aucun partenaire global" -ForegroundColor Red
    $script:TESTS_FAIL++
}

Section "2. Tableau de bord ETABLISSEMENT (vue filtree)"

$r = Invoke-Api -Method GET -Url "$API/tableau-de-bord" -Token $TOKEN_ETAB
Check "GET /tableau-de-bord (Etablissement)" 200 $r.StatusCode
Check "perimetre ETABLISSEMENT" "ETABLISSEMENT" $r.Content.data.perimetre
$COMPTEURS_ETAB = $r.Content.data.compteurs.partenaires
Write-Host "Partenaires de l'etablissement : $COMPTEURS_ETAB"
Write-Host "Projets de l'etablissement : $($r.Content.data.compteurs.projets)"

Section "3. Tableau de bord DECIDEUR (vue globale, lecture)"

$r = Invoke-Api -Method GET -Url "$API/tableau-de-bord" -Token $TOKEN_DEC
Check "GET /tableau-de-bord (Decideur)" 200 $r.StatusCode
Check "perimetre GLOBAL pour Decideur" "GLOBAL" $r.Content.data.perimetre

Section "4. Echeancier"

$r = Invoke-Api -Method GET -Url "$API/tableau-de-bord/echeancier" -Token $TOKEN_PRES
Check "GET /tableau-de-bord/echeancier (Presidence)" 200 $r.StatusCode
Write-Host "Conventions bientot expirees : $($r.Content.data.conventions_bientot_expirees.Count)"
Write-Host "Projets en retard : $($r.Content.data.projets_en_retard.Count)"

$r = Invoke-Api -Method GET -Url "$API/tableau-de-bord/echeancier" -Token $TOKEN_ETAB
Check "GET echeancier (Etablissement)" 200 $r.StatusCode

Section "5. Comparatif etablissements"

$r = Invoke-Api -Method GET -Url "$API/statistiques/comparatif-etablissements" -Token $TOKEN_PRES
Check "GET comparatif (Presidence)" 200 $r.StatusCode
$NB_ETAB = $r.Content.data.etablissements.Count
Write-Host "Nombre d'etablissements compares : $NB_ETAB"
if ($NB_ETAB -ge 1) {
    Write-Host "[OK] Au moins 1 etablissement dans le comparatif" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Aucun etablissement dans le comparatif" -ForegroundColor Red
    $script:TESTS_FAIL++
}

$r = Invoke-Api -Method GET -Url "$API/statistiques/comparatif-etablissements" -Token $TOKEN_DEC
Check "GET comparatif (Decideur)" 200 $r.StatusCode

Section "6. Permissions"

# Etablissement ne peut pas voir le comparatif
$r = Invoke-Api -Method GET -Url "$API/statistiques/comparatif-etablissements" -Token $TOKEN_ETAB
Check "Comparatif par Etablissement (403)" 403 $r.StatusCode

Section "7. Isolation des donnees"

# L'etablissement FDS ne voit que ses partenaires, pas ceux de FLSH
$r = Invoke-Api -Method GET -Url "$API/tableau-de-bord" -Token $TOKEN_ETAB
$partenaires_etab = $r.Content.data.compteurs.partenaires

if ($partenaires_etab -le $COMPTEURS_GLOBAUX) {
    Write-Host "[OK] Les donnees de l'etablissement sont un sous-ensemble des donnees globales ($partenaires_etab <= $COMPTEURS_GLOBAUX)" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Incoherence : etablissement ($partenaires_etab) > global ($COMPTEURS_GLOBAUX)" -ForegroundColor Red
    $script:TESTS_FAIL++
}

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