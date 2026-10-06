# test-espace-public.ps1
$API = "http://localhost:3000/api"

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

function Invoke-Public {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Method GET -Uri $Url -UseBasicParsing
        return @{ StatusCode = $response.StatusCode; Content = $response.Content | ConvertFrom-Json }
    } catch {
        $statusCode = 0
        if ($_.Exception.Response) { $statusCode = [int]$_.Exception.Response.StatusCode }
        return @{ StatusCode = $statusCode; Content = $null }
    }
}

Section "1. Accueil public (sans token)"

$r = Invoke-Public -Url "$API/public/accueil"
Check "GET /public/accueil (200)" 200 $r.StatusCode
Check "Statistiques presentes" $true ($null -ne $r.Content.data.statistiques)
Check "Publications recentes presentes" $true ($null -ne $r.Content.data.publications_recentes)

Section "2. Publications publiques (sans token)"

$r = Invoke-Public -Url "$API/public/publications"
Check "GET /public/publications (200)" 200 $r.StatusCode

Section "3. Etablissements publics (sans token)"

$r = Invoke-Public -Url "$API/public/etablissements"
Check "GET /public/etablissements (200)" 200 $r.StatusCode
$NB = $r.Content.data.Count
if ($NB -gt 0) {
    Write-Host "[OK] $NB etablissements retournes" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Aucun etablissement retourne" -ForegroundColor Red
    $script:TESTS_FAIL++
}

Section "4. Partenaires publics (sans token)"

$r = Invoke-Public -Url "$API/public/partenaires"
Check "GET /public/partenaires (200)" 200 $r.StatusCode

Section "5. Detail d'une publication"

$r = Invoke-Public -Url "$API/public/publications"
if ($r.Content.data.Count -gt 0) {
    $pubId = $r.Content.data[0].id
    $r2 = Invoke-Public -Url "$API/public/publications/$pubId"
    Check "GET /public/publications/:id (200)" 200 $r2.StatusCode
} else {
    Write-Host "[SKIP] Aucune publication publiee a tester" -ForegroundColor Yellow
}

Section "6. Verification de l'acces sans token"

# Les routes /public ne doivent PAS exiger de token
$r = Invoke-Public -Url "$API/public/etablissements"
Check "Acces sans token autorise" 200 $r.StatusCode

Section "7. Verification de la restriction de visibilite"

# Les partenaires retournes doivent tous etre PUBLIC
$r = Invoke-Public -Url "$API/public/partenaires"
if ($r.Content.data.Count -gt 0) {
    $tousPublics = $true
    foreach ($p in $r.Content.data) {
        if ($p.visibilite -and $p.visibilite -ne "PUBLIC") {
            $tousPublics = $false
        }
    }
    if ($tousPublics) {
        Write-Host "[OK] Tous les partenaires retournes sont publics" -ForegroundColor Green
        $script:TESTS_PASS++
    } else {
        Write-Host "[ECHEC] Certains partenaires ne sont pas publics" -ForegroundColor Red
        $script:TESTS_FAIL++
    }
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