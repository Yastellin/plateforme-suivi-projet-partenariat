# test-cleanup.ps1
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
        $statusCode = 0; $content = $null
        if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
            try { $content = $_.ErrorDetails.Message | ConvertFrom-Json } catch { $content = $_.ErrorDetails.Message }
        } elseif ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        if (-not $statusCode -and $_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        return @{ StatusCode = $statusCode; Content = $content }
    }
}

# Verifie l existence d un fichier dans le conteneur backend
function FichierExiste {
    param([string]$UrlRelative)
    $result = docker compose exec -T backend sh -c "test -f /app$UrlRelative && echo OK || echo MISSING" 2>$null
    if ($result) { return $result.Trim() }
    return "MISSING"
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

# ============================================
# 1. FICHIER RECENT NON REFERENCE (doit etre conserve)
# ============================================
Section "1. Fichier recent non reference (doit etre conserve)"

$testDir = "/app/uploads/_test-cleanup"
$urlRecent = "/uploads/_test-cleanup/recent.pdf"

# Creer le dossier et le fichier (date recente)
docker compose exec -T backend sh -c "mkdir -p $testDir && echo 'contenu recent' > /app$urlRecent" 2>$null | Out-Null
Start-Sleep -Seconds 1

Check "Fichier recent cree" "OK" (FichierExiste $urlRecent)

$r = Invoke-Api -Method POST -Url "$API/maintenance/nettoyage" -Token $TOKEN_PRES
Check "Nettoyage 1 (200)" 200 $r.StatusCode
Write-Host "Rapport : examines=$($r.Content.data.examines), supprimes=$($r.Content.data.supprimes), conserves=$($r.Content.data.conserves)"

Check "Fichier recent conserve (delai de grace)" "OK" (FichierExiste $urlRecent)

# ============================================
# 2. FICHIER ANCIEN NON REFERENCE (doit etre supprime)
# ============================================
Section "2. Fichier ancien non reference (doit etre supprime)"

$urlAncien = "/uploads/_test-cleanup/ancien.pdf"

# Creer le fichier puis le dater de 2 jours
# Calculer le timestamp cote PowerShell (2 jours en arriere)
$timestampAncien = [int][double]::Parse((Get-Date -UFormat %s)) - 172800
docker compose exec -T backend sh -c "echo 'contenu ancien' > /app$urlAncien && touch -d @$timestampAncien /app$urlAncien" 2>$null | Out-Null
Start-Sleep -Seconds 1

Check "Fichier ancien cree" "OK" (FichierExiste $urlAncien)

$r = Invoke-Api -Method POST -Url "$API/maintenance/nettoyage" -Token $TOKEN_PRES
Check "Nettoyage 2 (200)" 200 $r.StatusCode
Write-Host "Rapport : examines=$($r.Content.data.examines), supprimes=$($r.Content.data.supprimes), conserves=$($r.Content.data.conserves)"

Check "Fichier ancien orphelin supprime" "MISSING" (FichierExiste $urlAncien)

# ============================================
# 3. FICHIER REFERENCE EN BASE (doit etre conserve meme ancien)
# ============================================
Section "3. Fichier reference en base (doit etre conserve)"

# Uploader un document reel via l API
$rProjets = Invoke-Api -Method GET -Url "$API/projets" -Token $TOKEN_PRES
$PROJET_ID = $rProjets.Content.data.data[0].id

$fichierTest = "test-cleanup-reference.pdf"
"Contenu de test reference" | Out-File -FilePath $fichierTest -Encoding utf8

$outputFile = "upload-cleanup.json"
curl.exe -s -X POST "$API/documents" `
    -H "Authorization: Bearer $TOKEN_PRES" `
    -F "fichier=@$fichierTest" `
    -F "type=TDR" `
    -F "projet_id=$PROJET_ID" `
    -o $outputFile

$uploadResp = Get-Content $outputFile -Raw | ConvertFrom-Json
Remove-Item $outputFile -ErrorAction SilentlyContinue
Remove-Item $fichierTest -ErrorAction SilentlyContinue

$DOC_URL = $uploadResp.data.url_fichier
Write-Host "Document URL : $DOC_URL"

Check "Upload document reference" "success" $uploadResp.status

# Rendre le fichier ancien tout en le gardant reference en base
# 5 jours en arriere = 432000 secondes
$timestampCinq = [int][double]::Parse((Get-Date -UFormat %s)) - 432000
docker compose exec -T backend sh -c "touch -d @$timestampCinq /app$DOC_URL" 2>$null | Out-Null
Start-Sleep -Seconds 1

$r = Invoke-Api -Method POST -Url "$API/maintenance/nettoyage" -Token $TOKEN_PRES
Check "Nettoyage 3 (200)" 200 $r.StatusCode
Write-Host "Rapport : examines=$($r.Content.data.examines), supprimes=$($r.Content.data.supprimes), conserves=$($r.Content.data.conserves)"

Check "Fichier reference conserve malgre anciennete" "OK" (FichierExiste $DOC_URL)

# Nettoyage final : supprimer le document pour laisser la base propre
$docId = $uploadResp.data.id
Invoke-Api -Method DELETE -Url "$API/documents/$docId" -Token $TOKEN_PRES | Out-Null

# ============================================
# 4. PERMISSIONS
# ============================================
Section "4. Permissions"

$r = Invoke-Api -Method POST -Url "$API/maintenance/nettoyage" -Token $TOKEN_ETAB
Check "Nettoyage par Etablissement (403)" 403 $r.StatusCode

$r = Invoke-Api -Method POST -Url "$API/maintenance/nettoyage" -Token $TOKEN_DEC
Check "Nettoyage par Decideur (403)" 403 $r.StatusCode

$r = Invoke-Api -Method POST -Url "$API/maintenance/nettoyage" -Token $TOKEN_PRES
Check "Nettoyage par Presidence (200)" 200 $r.StatusCode

# ============================================
# 5. RAPPORT DETAILLE
# ============================================
Section "5. Rapport detaille"

$r = Invoke-Api -Method POST -Url "$API/maintenance/nettoyage" -Token $TOKEN_PRES
$rapport = $r.Content.data

Check "Champ examines present" $true ($null -ne $rapport.examines)
Check "Champ supprimes present" $true ($null -ne $rapport.supprimes)
Check "Champ conserves present" $true ($null -ne $rapport.conserves)
Check "Champ erreurs present" $true ($null -ne $rapport.erreurs)
Check "Champ duree_ms present" $true ($null -ne $rapport.duree_ms)

# ============================================
# NETTOYAGE FINAL DU DOSSIER DE TEST
# ============================================
docker compose exec -T backend sh -c "rm -rf $testDir" 2>$null | Out-Null

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