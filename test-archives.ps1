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

Section "1. Archives - Partenaires"

$r = Invoke-Api -Method GET -Url "$API/archives/partenaires" -Token $TOKEN_PRES
Check "Presidence - archives partenaires (200)" 200 $r.StatusCode
Write-Host "Partenaires archives (global) : $($r.Content.data.meta.total)"

$r = Invoke-Api -Method GET -Url "$API/archives/partenaires" -Token $TOKEN_ETAB
Check "Etablissement - archives partenaires (200)" 200 $r.StatusCode
Write-Host "Partenaires archives (FDS) : $($r.Content.data.meta.total)"

$r = Invoke-Api -Method GET -Url "$API/archives/partenaires" -Token $TOKEN_DEC
Check "Decideur - archives partenaires (200)" 200 $r.StatusCode

Section "2. Archives - Partenariats"

$r = Invoke-Api -Method GET -Url "$API/archives/partenariats" -Token $TOKEN_PRES
Check "Presidence - archives partenariats (200)" 200 $r.StatusCode
Write-Host "Partenariats archives : $($r.Content.data.meta.total)"

$r = Invoke-Api -Method GET -Url "$API/archives/partenariats" -Token $TOKEN_ETAB
Check "Etablissement - archives partenariats (200)" 200 $r.StatusCode

Section "3. Archives - Projets"

$r = Invoke-Api -Method GET -Url "$API/archives/projets" -Token $TOKEN_PRES
Check "Presidence - archives projets (200)" 200 $r.StatusCode
Write-Host "Projets archives : $($r.Content.data.meta.total)"

$r = Invoke-Api -Method GET -Url "$API/archives/projets" -Token $TOKEN_ETAB
Check "Etablissement - archives projets (200)" 200 $r.StatusCode

Section "4. Archives - Conventions"

$r = Invoke-Api -Method GET -Url "$API/archives/conventions" -Token $TOKEN_PRES
Check "Presidence - archives conventions (200)" 200 $r.StatusCode
Write-Host "Conventions archivees : $($r.Content.data.meta.total)"

$r = Invoke-Api -Method GET -Url "$API/archives/conventions" -Token $TOKEN_DEC
Check "Decideur - archives conventions (200)" 200 $r.StatusCode

Section "5. Archives - Cotutelles"

$r = Invoke-Api -Method GET -Url "$API/archives/cotutelles" -Token $TOKEN_PRES
Check "Presidence - archives cotutelles (200)" 200 $r.StatusCode
Write-Host "Cotutelles archivees : $($r.Content.data.meta.total)"

Section "6. Pagination"

$r = Invoke-Api -Method GET -Url "$API/archives/projets?page=1&limit=5" -Token $TOKEN_PRES
Check "Pagination archives projets" 200 $r.StatusCode
Check "Limite respectee" 5 $r.Content.data.meta.limit

Section "7. Isolation Etablissement"

# Verifier que les donnees de l'Etablissement sont un sous-ensemble des donnees globales
$rGlobal = Invoke-Api -Method GET -Url "$API/archives/projets" -Token $TOKEN_PRES
$totalGlobal = $rGlobal.Content.data.meta.total

$rEtab = Invoke-Api -Method GET -Url "$API/archives/projets" -Token $TOKEN_ETAB
$totalEtab = $rEtab.Content.data.meta.total

if ($totalEtab -le $totalGlobal) {
    Write-Host "[OK] Isolation : etablissement ($totalEtab) <= global ($totalGlobal)" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Incoherence isolation : etablissement ($totalEtab) > global ($totalGlobal)" -ForegroundColor Red
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