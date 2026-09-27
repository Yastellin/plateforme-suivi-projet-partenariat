# test-refresh-rotation.ps1
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
    $params = @{ Method = $Method; Uri = $Url; Headers = $headers; UseBasicParsing = $true }
    if ($Body) { $params["Body"] = ($Body | ConvertTo-Json -Depth 10 -Compress) }

    try {
        $response = Invoke-WebRequest @params
        return @{ StatusCode = $response.StatusCode; Content = $response.Content | ConvertFrom-Json }
    } catch {
        $statusCode = 0
        $content = $null
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            try { $content = $_.ErrorDetails.Message | ConvertFrom-Json }
            catch { $content = $_.ErrorDetails.Message }
        } elseif ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        if (-not $statusCode -and $_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        return @{ StatusCode = $statusCode; Content = $content }
    }
}

Section "1. Login initial"

$r = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "fds@univ-fianarantsoa.mg"; mot_de_passe = $PASS
}
Check "Login (200 ou 201)" $true ($r.StatusCode -eq 200 -or $r.StatusCode -eq 201)
$ACCESS_1 = $r.Content.data.access_token
$REFRESH_1 = $r.Content.data.refresh_token
Check "Access token present" $true ($null -ne $ACCESS_1 -and $ACCESS_1.Length -gt 20)
Check "Refresh token present" $true ($null -ne $REFRESH_1 -and $REFRESH_1.Length -gt 20)

Section "2. Premier refresh (rotation)"

$r = Invoke-Api -Method POST -Url "$API/auth/refresh" -Body @{
    refresh_token = $REFRESH_1
}
Check "Refresh (200)" 200 $r.StatusCode
$ACCESS_2 = $r.Content.data.access_token
$REFRESH_2 = $r.Content.data.refresh_token
Check "Nouveau access token retourne" $true ($null -ne $ACCESS_2)
Check "Nouveau refresh token retourne" $true ($null -ne $REFRESH_2)
Check "Les deux tokens sont differents" $true ($REFRESH_1 -ne $REFRESH_2)

Section "3. Reutilisation de l'ancien refresh token (doit echouer)"

$r = Invoke-Api -Method POST -Url "$API/auth/refresh" -Body @{
    refresh_token = $REFRESH_1
}
Check "Ancien token rejete (401)" 401 $r.StatusCode

Section "4. Nouveau refresh token fonctionne"

$r = Invoke-Api -Method POST -Url "$API/auth/refresh" -Body @{
    refresh_token = $REFRESH_2
}
Check "Nouveau token accepte (200)" 200 $r.StatusCode
$REFRESH_3 = $r.Content.data.refresh_token
Check "Nouveau refresh 3 different" $true ($REFRESH_2 -ne $REFRESH_3)

Section "5. Utilisation de l'access token recu"

$r = Invoke-Api -Method GET -Url "$API/auth/me" -Token $ACCESS_2
Check "GET /auth/me avec access token (200)" 200 $r.StatusCode

Section "6. Logout (revoque tous les tokens de l'utilisateur)"

$r = Invoke-Api -Method POST -Url "$API/auth/logout" -Token $ACCESS_2
Check "Logout (200 ou 201)" $true ($r.StatusCode -eq 200 -or $r.StatusCode -eq 201)

Section "7. Refresh apres logout (doit echouer)"

$r = Invoke-Api -Method POST -Url "$API/auth/refresh" -Body @{
    refresh_token = $REFRESH_3
}
Check "Refresh apres logout (401)" 401 $r.StatusCode

Section "8. Re-login fonctionne"

$r = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "fds@univ-fianarantsoa.mg"; mot_de_passe = $PASS
}
Check "Re-login (200)" 200 $r.StatusCode
Check "Nouveau refresh token apres re-login" $true ($null -ne $r.Content.data.refresh_token)

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