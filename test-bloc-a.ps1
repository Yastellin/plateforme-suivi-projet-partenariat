# test-bloc-a.ps1
# Test du Bloc A : validation env, Helmet, graceful shutdown, healthcheck

$API = "http://localhost:3000/api"
$ROOT = "http://localhost:3000"

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

Section "1. Healthcheck"

try {
    $r = Invoke-WebRequest -Method GET -Uri "$API/health" -UseBasicParsing
    $enveloppe = $r.Content | ConvertFrom-Json
    $body = $enveloppe.data

    Check "GET /api/health (200)" 200 $r.StatusCode
    Check "Status = ok" "ok" $body.status
    Check "Base de donnees OK" "ok" $body.dependances.base_de_donnees
} catch {
    Check "GET /api/health (200)" 200 $_.Exception.Response.StatusCode
}

Section "2. Healthcheck accessible sans authentification"

# /api/health ne doit PAS exiger de token (Public)
try {
    $r = Invoke-WebRequest -Method GET -Uri "$API/health" -UseBasicParsing
    Check "Accessible sans token (200)" 200 $r.StatusCode
} catch {
    Check "Accessible sans token (200)" 200 $_.Exception.Response.StatusCode
}

Section "3. Helmet - en-tetes de securite"

try {
    $r = Invoke-WebRequest -Method GET -Uri "$API/health" -UseBasicParsing
    $headers = $r.Headers

    if ($headers['X-Content-Type-Options'] -eq 'nosniff') {
        Write-Host "[OK] X-Content-Type-Options: nosniff" -ForegroundColor Green
        $script:TESTS_PASS++
    } else {
        Write-Host "[ECHEC] X-Content-Type-Options absent ou incorrect" -ForegroundColor Red
        $script:TESTS_FAIL++
    }

    if ($headers['X-Frame-Options'] -eq 'SAMEORIGIN') {
        Write-Host "[OK] X-Frame-Options: SAMEORIGIN" -ForegroundColor Green
        $script:TESTS_PASS++
    } else {
        Write-Host "[ECHEC] X-Frame-Options absent ou incorrect (recu: $($headers['X-Frame-Options']))" -ForegroundColor Red
        $script:TESTS_FAIL++
    }

    if ($headers['X-Powered-By'] -eq $null) {
        Write-Host "[OK] X-Powered-By supprime" -ForegroundColor Green
        $script:TESTS_PASS++
    } else {
        Write-Host "[ECHEC] X-Powered-By encore present" -ForegroundColor Red
        $script:TESTS_FAIL++
    }

    if ($headers['Strict-Transport-Security']) {
        Write-Host "[OK] Strict-Transport-Security present" -ForegroundColor Green
        $script:TESTS_PASS++
    } else {
        Write-Host "[INFO] Strict-Transport-Security absent (normal en HTTP local)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ECHEC] Impossible de lire les en-tetes" -ForegroundColor Red
    $script:TESTS_FAIL++
}

Section "4. Endpoint principal toujours accessible"

try {
    $r = Invoke-WebRequest -Method GET -Uri "$API" -UseBasicParsing
    Check "GET /api (200)" 200 $r.StatusCode
} catch {
    Check "GET /api (200)" 200 $_.Exception.Response.StatusCode
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