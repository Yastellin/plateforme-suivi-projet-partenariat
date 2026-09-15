# test-documents.ps1
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

if (-not $TOKEN_PRES) { Write-Host "Echec login PRESIDENCE" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Login PRESIDENCE" -ForegroundColor Green
Write-Host "[OK] Login ETABLISSEMENT" -ForegroundColor Green

Section "1. Recuperation d'un projet"

$rProjets = Invoke-Api -Method GET -Url "$API/projets" -Token $TOKEN_PRES
$PROJET_ID = $rProjets.Content.data.data[0].id
Write-Host "PROJET ID : $PROJET_ID"

Section "2. Upload d'un document"

$fichierTest = "test-document.pdf"
"Contenu de test PDF" | Out-File -FilePath $fichierTest -Encoding utf8

$outputFile = "upload-response.json"
curl.exe -s -X POST "$API/documents" `
    -H "Authorization: Bearer $TOKEN_PRES" `
    -F "fichier=@$fichierTest" `
    -F "type=TDR" `
    -F "nom_fichier=Termes de reference test" `
    -F "projet_id=$PROJET_ID" `
    -o $outputFile

$response = Get-Content $outputFile -Raw | ConvertFrom-Json
Remove-Item $outputFile -ErrorAction SilentlyContinue
Remove-Item $fichierTest -ErrorAction SilentlyContinue

$DOC_ID = $null
if ($response.status -eq "success") {
    $DOC_ID = $response.data.id
    Write-Host "[OK] Upload document (ID: $DOC_ID)" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Upload document : $($response.message)" -ForegroundColor Red
    $script:TESTS_FAIL++
}

Section "3. Detail du document"

if ($DOC_ID) {
    $r = Invoke-Api -Method GET -Url "$API/documents/$DOC_ID" -Token $TOKEN_PRES
    Check "GET /documents/:id (200)" 200 $r.StatusCode
    Check "Type = TDR" "TDR" $r.Content.data.type
    Check "Version = 1" 1 $r.Content.data.version
}

Section "4. Permissions"

if ($DOC_ID) {
    $r = Invoke-Api -Method GET -Url "$API/documents/$DOC_ID" -Token $TOKEN_ETAB
    Check "Lecture par Etablissement (403)" 403 $r.StatusCode
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