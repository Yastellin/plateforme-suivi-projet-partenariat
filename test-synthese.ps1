# test-synthese.ps1
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

Section "1. Recuperation d'un etablissement"

$r = Invoke-Api -Method GET -Url "$API/etablissements" -Token $TOKEN_PRES
$ETAB_ID = $r.Content.data.data[0].id
$ETAB_NOM = $r.Content.data.data[0].nom
Write-Host "ETABLISSEMENT ID : $ETAB_ID ($ETAB_NOM)"

$r = Invoke-Api -Method GET -Url "$API/partenaires" -Token $TOKEN_PRES
$PARTENAIRE_ID = $r.Content.data.data[0].id
Write-Host "PARTENAIRE ID : $PARTENAIRE_ID"

Section "2. Synthese globale"

$r = Invoke-Api -Method GET -Url "$API/synthese" -Token $TOKEN_PRES
Check "Synthese globale (200)" 200 $r.StatusCode
$ANNEE = $r.Content.data.annee
Check "Annee courante" (Get-Date).Year $ANNEE
$NB_ETABS = $r.Content.data.etablissements.Count
if ($NB_ETABS -gt 0) {
    Write-Host "[OK] Synthese contient des etablissements ($NB_ETABS)" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Aucun etablissement dans la synthese" -ForegroundColor Red
    $script:TESTS_FAIL++
}

Section "3. Synthese par etablissement"

$r = Invoke-Api -Method GET -Url "$API/synthese/$ETAB_ID" -Token $TOKEN_PRES
Check "Synthese par etablissement (200)" 200 $r.StatusCode
Check "Etablissement ID correct" $ETAB_ID $r.Content.data.etablissement_id
Check "Compteurs presents" $true ($null -ne $r.Content.data.compteurs)

Section "4. Creation d'un item narratif"

$r = Invoke-Api -Method POST -Url "$API/synthese/items" -Token $TOKEN_PRES -Body @{
    etablissement_id = $ETAB_ID
    annee = $ANNEE
    type = "DOMAINE_PRINCIPAL"
    valeur = "Recherche en biologie marine"
}
Check "Creation item (201)" 201 $r.StatusCode
$ITEM_ID = $r.Content.data.id

# Doublon (meme etablissement + annee + type) -> 409
$r = Invoke-Api -Method POST -Url "$API/synthese/items" -Token $TOKEN_PRES -Body @{
    etablissement_id = $ETAB_ID
    annee = $ANNEE
    type = "DOMAINE_PRINCIPAL"
    valeur = "Autre valeur"
}
Check "Item en doublon (409)" 409 $r.StatusCode

Section "5. Liste des items"

$r = Invoke-Api -Method GET -Url "$API/synthese/items?annee=$ANNEE" -Token $TOKEN_PRES
Check "Liste items (200)" 200 $r.StatusCode

Section "6. Designation d'un partenaire strategique"

$r = Invoke-Api -Method POST -Url "$API/synthese/partenaires-strategiques" -Token $TOKEN_PRES -Body @{
    etablissement_id = $ETAB_ID
    annee = $ANNEE
    partenaire_id = $PARTENAIRE_ID
}
Check "Creation partenaire strategique (201)" 201 $r.StatusCode
$PS_ID = $r.Content.data.id

# Doublon -> 409
$r = Invoke-Api -Method POST -Url "$API/synthese/partenaires-strategiques" -Token $TOKEN_PRES -Body @{
    etablissement_id = $ETAB_ID
    annee = $ANNEE
    partenaire_id = $PARTENAIRE_ID
}
Check "Partenaire strategique en doublon (409)" 409 $r.StatusCode

Section "7. Liste des partenaires strategiques"

$r = Invoke-Api -Method GET -Url "$API/synthese/partenaires-strategiques?annee=$ANNEE" -Token $TOKEN_PRES
Check "Liste partenaires strategiques (200)" 200 $r.StatusCode

Section "8. Permissions"

# Etablissement ne peut pas creer d'item
$r = Invoke-Api -Method POST -Url "$API/synthese/items" -Token $TOKEN_ETAB -Body @{
    etablissement_id = $ETAB_ID
    annee = $ANNEE
    type = "DEFI_MAJEUR"
    valeur = "Test interdit"
}
Check "Creation item par Etablissement (403)" 403 $r.StatusCode

# Decideur peut lire la synthese
$r = Invoke-Api -Method GET -Url "$API/synthese" -Token $TOKEN_DEC
Check "Lecture synthese par Decideur (200)" 200 $r.StatusCode

# Decideur ne peut pas creer
$r = Invoke-Api -Method POST -Url "$API/synthese/items" -Token $TOKEN_DEC -Body @{
    etablissement_id = $ETAB_ID
    annee = $ANNEE
    type = "PRIORITE_FUTURE"
    valeur = "Test interdit"
}
Check "Creation item par Decideur (403)" 403 $r.StatusCode

Section "9. Suppression"

if ($ITEM_ID) {
    $r = Invoke-Api -Method DELETE -Url "$API/synthese/items/$ITEM_ID" -Token $TOKEN_PRES
    Check "Suppression item (200)" 200 $r.StatusCode
}

if ($PS_ID) {
    $r = Invoke-Api -Method DELETE -Url "$API/synthese/partenaires-strategiques/$PS_ID" -Token $TOKEN_PRES
    Check "Suppression partenaire strategique (200)" 200 $r.StatusCode
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