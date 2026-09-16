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

Section "1. Recuperation d'un projet"

$rProjets = Invoke-Api -Method GET -Url "$API/projets" -Token $TOKEN_PRES
$PROJET_ID = $rProjets.Content.data.data[0].id
Write-Host "PROJET ID : $PROJET_ID"

Section "2. Creation d'une publication"

$r = Invoke-Api -Method POST -Url "$API/publications" -Token $TOKEN_PRES -Body @{
    titre = "Projet Biodiversite : premiers resultats"
    description_publique = "Retour sur la premiere annee du projet"
    statut = "BROUILLON"
    resultats = "Cinq especes endemiques identifiees"
    projet_id = $PROJET_ID
}
Check "Creation publication (201)" 201 $r.StatusCode
$PUBLICATION_ID = $r.Content.data.id
Check "Titre" "Projet Biodiversite : premiers resultats" $r.Content.data.titre
Check "Statut BROUILLON" "BROUILLON" $r.Content.data.statut
Check "Photos vides" 0 $r.Content.data.photos.Count
Write-Host "PUBLICATION ID : $PUBLICATION_ID"

Section "3. Projet deja associe"

$r = Invoke-Api -Method POST -Url "$API/publications" -Token $TOKEN_PRES -Body @{
    titre = "Doublon"
    projet_id = $PROJET_ID
}
Check "Projet deja associe (409)" 409 $r.StatusCode

Section "4. Liste + filtres"

$r = Invoke-Api -Method GET -Url "$API/publications" -Token $TOKEN_PRES
Check "Liste publications" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/publications?statut=BROUILLON" -Token $TOKEN_PRES
Check "Filtre statut" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/publications?projet_id=$PROJET_ID" -Token $TOKEN_PRES
Check "Filtre par projet" 200 $r.StatusCode

Section "5. Detail"

$r = Invoke-Api -Method GET -Url "$API/publications/$PUBLICATION_ID" -Token $TOKEN_PRES
Check "GET /publications/:id" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/publications/00000000-0000-0000-0000-000000000000" -Token $TOKEN_PRES
Check "GET inexistant (404)" 404 $r.StatusCode

Section "6. Modification"

$r = Invoke-Api -Method PATCH -Url "$API/publications/$PUBLICATION_ID" -Token $TOKEN_PRES -Body @{
    resultats = "Resultats mis a jour"
    description_publique = "Description mise a jour"
}
Check "Modification (200)" 200 $r.StatusCode
Check "Resultats" "Resultats mis a jour" $r.Content.data.resultats

Section "7. Upload d'une photo"

# Creer une image test (petit fichier PNG valide, 1x1 pixel)
$fichierTest = "test-photo.png"
$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
[IO.File]::WriteAllBytes((Join-Path (Get-Location) $fichierTest), [Convert]::FromBase64String($pngBase64))

$outputFile = "upload-photo.json"
curl.exe -s -X POST "$API/publications/$PUBLICATION_ID/photos" `
    -H "Authorization: Bearer $TOKEN_PRES" `
    -F "fichier=@$fichierTest" `
    -F "legende=Premiere photo de test" `
    -F "ordre=0" `
    -o $outputFile

$response = Get-Content $outputFile -Raw | ConvertFrom-Json
Remove-Item $outputFile -ErrorAction SilentlyContinue
Remove-Item $fichierTest -ErrorAction SilentlyContinue

$PHOTO_ID = $null
if ($response.status -eq "success") {
    $PHOTO_ID = $response.data.id
    Write-Host "[OK] Upload photo (ID: $PHOTO_ID)" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Upload photo : $($response.message)" -ForegroundColor Red
    $script:TESTS_FAIL++
}

Section "8. Liste des photos"

$r = Invoke-Api -Method GET -Url "$API/publications/$PUBLICATION_ID/photos" -Token $TOKEN_PRES
Check "Liste photos" 200 $r.StatusCode
Check "1 photo" 1 $r.Content.data.Count

Section "9. Publication"

$r = Invoke-Api -Method PATCH -Url "$API/publications/$PUBLICATION_ID/publier" -Token $TOKEN_PRES
Check "Publication (200)" 200 $r.StatusCode
Check "Statut PUBLIEE" "PUBLIEE" $r.Content.data.statut

# Re-publier (conflit)
$r = Invoke-Api -Method PATCH -Url "$API/publications/$PUBLICATION_ID/publier" -Token $TOKEN_PRES
Check "Re-publication (409)" 409 $r.StatusCode

Section "10. Permissions"

# Etablissement ne peut pas creer
$r = Invoke-Api -Method POST -Url "$API/publications" -Token $TOKEN_ETAB -Body @{
    titre = "Interdit"
    projet_id = "00000000-0000-0000-0000-000000000000"
}
Check "Creation par Etablissement (403)" 403 $r.StatusCode

# Decideur peut lire
$r = Invoke-Api -Method GET -Url "$API/publications" -Token $TOKEN_DEC
Check "Lecture par Decideur (200)" 200 $r.StatusCode

# Decideur ne peut pas creer
$r = Invoke-Api -Method POST -Url "$API/publications" -Token $TOKEN_DEC -Body @{
    titre = "Interdit"
    projet_id = "00000000-0000-0000-0000-000000000000"
}
Check "Creation par Decideur (403)" 403 $r.StatusCode

Section "11. Suppression d'une photo"

if ($PHOTO_ID) {
    $r = Invoke-Api -Method DELETE -Url "$API/photos/$PHOTO_ID" -Token $TOKEN_PRES
    Check "Suppression photo (200)" 200 $r.StatusCode

    $r = Invoke-Api -Method GET -Url "$API/publications/$PUBLICATION_ID/photos" -Token $TOKEN_PRES
    Check "0 photo restante" 0 $r.Content.data.Count
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