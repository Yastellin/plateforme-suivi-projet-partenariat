# test-rate-limit.ps1
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

Section "1. Limite sur /auth/login (5 tentatives/minute)"

$body = @{ email = "faux@test.mg"; mot_de_passe = "wrongpassword" } | ConvertTo-Json
$codes = @()

for ($i = 1; $i -le 7; $i++) {
    try {
        $r = Invoke-WebRequest -Method POST -Uri "$API/auth/login" `
            -ContentType "application/json" -Body $body -UseBasicParsing
        $codes += $r.StatusCode
    } catch {
        $codes += [int]$_.Exception.Response.StatusCode
    }
}

Write-Host "Codes obtenus : $($codes -join ', ')"

# Les 5 premieres doivent etre 401 (identifiants invalides)
# La 6eme et 7eme doivent etre 429 (rate limited)
$premiers401 = ($codes[0..4] | Where-Object { $_ -eq 401 }).Count
$derniers429 = ($codes[5..6] | Where-Object { $_ -eq 429 }).Count

Check "5 premieres tentatives : 401" 5 $premiers401
Check "2 dernieres tentatives : 429" 2 $derniers429

Section "2. Message francise sur 429"

try {
    Invoke-WebRequest -Method POST -Uri "$API/auth/login" `
        -ContentType "application/json" -Body $body -UseBasicParsing | Out-Null
} catch {
    $message = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($message.message -match "Trop de requetes") {
        Write-Host "[OK] Message francise : $($message.message)" -ForegroundColor Green
        $script:TESTS_PASS++
    } else {
        Write-Host "[ECHEC] Message inattendu : $($message.message)" -ForegroundColor Red
        $script:TESTS_FAIL++
    }
    Check "Signature ITDCMADA" "ITDCMADA" $message.signature
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