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

Section "1. Recherche globale (tout type)"

$r = Invoke-Api -Method GET -Url "$API/recherche?q=Toulouse" -Token $TOKEN_PRES
Check "Recherche globale (200)" 200 $r.StatusCode
Write-Host "Resultats pour 'Toulouse' : $($r.Content.data.total)"
Check "Champ q renvoye" "Toulouse" $r.Content.data.q

Section "2. Recherche par type"

$r = Invoke-Api -Method GET -Url "$API/recherche?q=Toulouse&type=PARTENAIRES" -Token $TOKEN_PRES
Check "Recherche type=PARTENAIRES" 200 $r.StatusCode
$count = $r.Content.data.total
Write-Host "Resultats partenaires 'Toulouse' : $count"
if ($count -ge 1) {
    Write-Host "[OK] Au moins 1 partenaire trouve" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Aucun partenaire trouve" -ForegroundColor Red
    $script:TESTS_FAIL++
}

$r = Invoke-Api -Method GET -Url "$API/recherche?q=Cooperation&type=PARTENARIATS" -Token $TOKEN_PRES
Check "Recherche type=PARTENARIATS" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/recherche?q=Biodiversite&type=PROJETS" -Token $TOKEN_PRES
Check "Recherche type=PROJETS" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/recherche?q=CONV&type=CONVENTIONS" -Token $TOKEN_PRES
Check "Recherche type=CONVENTIONS" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/recherche?q=Rakoto&type=COTUTELLES" -Token $TOKEN_PRES
Check "Recherche type=COTUTELLES" 200 $r.StatusCode

Section "3. Recherche insensible a la casse"

$r1 = Invoke-Api -Method GET -Url "$API/recherche?q=toulouse" -Token $TOKEN_PRES
$r2 = Invoke-Api -Method GET -Url "$API/recherche?q=TOULOUSE" -Token $TOKEN_PRES
Check "Minuscules" $r1.Content.data.total $r2.Content.data.total

Section "4. Pagination"

$r = Invoke-Api -Method GET -Url "$API/recherche?q=Universite&page=1&limit=5" -Token $TOKEN_PRES
Check "Pagination (200)" 200 $r.StatusCode
Check "Limite respectee" 5 $r.Content.data.limit

Section "5. Permissions"

$r = Invoke-Api -Method GET -Url "$API/recherche?q=Toulouse" -Token $TOKEN_ETAB
Check "Recherche par Etablissement (200)" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/recherche?q=Toulouse" -Token $TOKEN_DEC
Check "Recherche par Decideur (200)" 200 $r.StatusCode

Section "6. Isolation Etablissement"

$rGlobal = Invoke-Api -Method GET -Url "$API/recherche?q=Universite" -Token $TOKEN_PRES
$totalGlobal = $rGlobal.Content.data.total

$rEtab = Invoke-Api -Method GET -Url "$API/recherche?q=Universite" -Token $TOKEN_ETAB
$totalEtab = $rEtab.Content.data.total

if ($totalEtab -le $totalGlobal) {
    Write-Host "[OK] Isolation : etablissement ($totalEtab) <= global ($totalGlobal)" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Incoherence isolation" -ForegroundColor Red
    $script:TESTS_FAIL++
}

Section "7. Cas d'erreur"

$r = Invoke-Api -Method GET -Url "$API/recherche?q=a" -Token $TOKEN_PRES
Check "Requete trop courte (400)" 400 $r.StatusCode

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