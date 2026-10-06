# test-export.ps1
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

function Test-Fichier {
    param($Label, $Url, $Token, $NomFichier)
    try {
        Invoke-WebRequest -Method GET -Uri $Url -Headers @{ Authorization = "Bearer $Token" } -OutFile $NomFichier -ErrorAction Stop
        if (Test-Path $NomFichier) {
            $taille = (Get-Item $NomFichier).Length
            if ($taille -gt 100) {
                Write-Host "[OK] $Label ($taille octets)" -ForegroundColor Green
                $script:TESTS_PASS++
            } else {
                Write-Host "[ECHEC] $Label (fichier trop petit : $taille octets)" -ForegroundColor Red
                $script:TESTS_FAIL++
            }
            Remove-Item $NomFichier -ErrorAction SilentlyContinue
        } else {
            Write-Host "[ECHEC] $Label (fichier non genere)" -ForegroundColor Red
            $script:TESTS_FAIL++
        }
    } catch {
        $statusCode = 0
        if ($_.Exception.Response) { $statusCode = [int]$_.Exception.Response.StatusCode }
        Write-Host "[ECHEC] $Label (HTTP $statusCode)" -ForegroundColor Red
        $script:TESTS_FAIL++
    }
}

Section "0. Authentification"

$body = @{ email = "presidence@univ-fianarantsoa.mg"; mot_de_passe = $PASS } | ConvertTo-Json
$login = Invoke-RestMethod -Method POST -Uri "$API/auth/login" -ContentType "application/json" -Body $body
$TOKEN_PRES = $login.data.access_token

$body = @{ email = "president@univ-fianarantsoa.mg"; mot_de_passe = $PASS } | ConvertTo-Json
$login = Invoke-RestMethod -Method POST -Uri "$API/auth/login" -ContentType "application/json" -Body $body
$TOKEN_DEC = $login.data.access_token

if (-not $TOKEN_PRES) { Write-Host "Echec login" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Login PRESIDENCE" -ForegroundColor Green
Write-Host "[OK] Login DECIDEUR" -ForegroundColor Green

Section "1. Export PDF projets"

Test-Fichier "PDF projets" "$API/export/projets?format=pdf" $TOKEN_PRES "temp-projets.pdf"

Section "2. Export Excel projets"

Test-Fichier "XLSX projets" "$API/export/projets?format=xlsx" $TOKEN_PRES "temp-projets.xlsx"

Section "3. Export PDF conventions"

Test-Fichier "PDF conventions" "$API/export/conventions?format=pdf" $TOKEN_PRES "temp-conv.pdf"

Section "4. Export Excel conventions"

Test-Fichier "XLSX conventions" "$API/export/conventions?format=xlsx" $TOKEN_PRES "temp-conv.xlsx"

Section "5. Format par defaut (PDF)"

Test-Fichier "Export projets sans format" "$API/export/projets" $TOKEN_PRES "temp-default.pdf"

Section "6. Permissions"

Test-Fichier "Export par DECIDEUR" "$API/export/projets?format=pdf" $TOKEN_DEC "temp-dec.pdf"

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