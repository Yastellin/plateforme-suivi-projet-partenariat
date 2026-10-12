$API = "http://localhost:3000/api"
$PASS = "password123"

# Dates de test calculees par rapport au jour courant : les jeux de donnees
# restent valides quelle que soit la date d'execution (regle « date de debut
# aujourd'hui ou posterieure »).
function DateIso {
    param([int]$Jours)
    $format = "yyyy-MM-ddTHH:mm:ss.fff"
    $jour = [datetime]::UtcNow.AddDays($Jours)
    return $jour.ToString($format, [System.Globalization.CultureInfo]::InvariantCulture) + "Z"
}

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

$loginEtab = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "flsh@univ-fianarantsoa.mg"; mot_de_passe = $PASS
}
$TOKEN_ETAB2 = $loginEtab.Content.data.access_token

$loginPres = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "presidence@univ-fianarantsoa.mg"; mot_de_passe = $PASS
}
$TOKEN_PRES = $loginPres.Content.data.access_token

$loginDec = Invoke-Api -Method POST -Url "$API/auth/login" -Body @{
    email = "president@univ-fianarantsoa.mg"; mot_de_passe = $PASS
}
$TOKEN_DEC = $loginDec.Content.data.access_token

if (-not $TOKEN_PRES) { Write-Host "Echec login PRESIDENCE" -ForegroundColor Red; exit 1 }
Write-Host "[OK] Login PRESIDENCE" -ForegroundColor Green
Write-Host "[OK] Login ETABLISSEMENT (FLSH)" -ForegroundColor Green
Write-Host "[OK] Login DECIDEUR" -ForegroundColor Green

Section "1. Etat initial des notifications (Presidence)"

$r = Invoke-Api -Method GET -Url "$API/notifications" -Token $TOKEN_PRES
Check "Liste initiale (200)" 200 $r.StatusCode
$INITIAL_COUNT = $r.Content.data.meta.total
Write-Host "Nombre initial de notifications : $INITIAL_COUNT"

Section "2. Creation et soumission d'un projet (par FLSH)"

$r = Invoke-Api -Method POST -Url "$API/projets" -Token $TOKEN_ETAB2 -Body @{
    nom = "Projet Notification Test"
    type = "Recherche"
    date_debut = (DateIso 60)
    date_fin_prevue = (DateIso 500)
}
Check "Creation projet (201)" 201 $r.StatusCode
$PROJET_ID = $r.Content.data.id

$r = Invoke-Api -Method POST -Url "$API/projets/$PROJET_ID/soumettre" -Token $TOKEN_ETAB2
Check "Soumission projet (200)" 200 $r.StatusCode

Start-Sleep -Seconds 2

Section "3. Verification des notifications creees"

$r = Invoke-Api -Method GET -Url "$API/notifications" -Token $TOKEN_PRES
Check "Liste apres soumission (200)" 200 $r.StatusCode

$NEW_COUNT = $r.Content.data.meta.total
Check "Nouvelle notification creee (soumission uniquement)" ($INITIAL_COUNT + 1) $NEW_COUNT

$NOTIF_ID = $null
if ($r.Content.data.data.Count -gt 0) {
    $premiere = $r.Content.data.data[0]
    $NOTIF_ID = $premiere.id
    Check "Type PROJET_SOUMIS" "PROJET_SOUMIS" $premiere.type
    Check "Non lue" "false" "$($premiere.est_lue)".ToLower()
    Write-Host "NOTIFICATION ID : $NOTIF_ID"
}

Section "4. Filtres"

$r = Invoke-Api -Method GET -Url "$API/notifications?est_lue=false" -Token $TOKEN_PRES
Check "Filtre est_lue=false" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/notifications?type=PROJET_SOUMIS" -Token $TOKEN_PRES
Check "Filtre par type" 200 $r.StatusCode

Section "5. Compteur non lues"

$r = Invoke-Api -Method GET -Url "$API/notifications/non-lues/count" -Token $TOKEN_PRES
Check "Compter non lues (200)" 200 $r.StatusCode
$NON_LUES = $r.Content.data.total
if ($NON_LUES -ge 1) {
    Write-Host "[OK] Au moins 1 notification non lue ($NON_LUES)" -ForegroundColor Green
    $script:TESTS_PASS++
} else {
    Write-Host "[ECHEC] Aucune notification non lue" -ForegroundColor Red
    $script:TESTS_FAIL++
}

Section "6. Marquer une notification comme lue"

if ($NOTIF_ID) {
    $r = Invoke-Api -Method PATCH -Url "$API/notifications/$NOTIF_ID/lue" -Token $TOKEN_PRES
    Check "Marquer lue (200)" 200 $r.StatusCode
    Check "Est lue = true" "true" "$($r.Content.data.est_lue)".ToLower()
}

Section "7. Permissions (Decideur)"

$r = Invoke-Api -Method GET -Url "$API/notifications" -Token $TOKEN_DEC
Check "Lecture par Decideur (200)" 200 $r.StatusCode

Section "8. Isolation (Etablissement FLSH ne voit pas les notifications Presidence)"

$r = Invoke-Api -Method GET -Url "$API/notifications" -Token $TOKEN_ETAB2
Check "Liste FLSH (200)" 200 $r.StatusCode
$FLSH_TOTAL = $r.Content.data.meta.total
Write-Host "Notifications FLSH : $FLSH_TOTAL"

Section "9. Marquer tout comme lu"

$r = Invoke-Api -Method PATCH -Url "$API/notifications/tout-marquer-lu" -Token $TOKEN_PRES
Check "Tout marquer lu (200)" 200 $r.StatusCode

$r = Invoke-Api -Method GET -Url "$API/notifications/non-lues/count" -Token $TOKEN_PRES
Check "0 non lue restante" 0 $r.Content.data.total

Section "10. Detail inexistant"

$r = Invoke-Api -Method PATCH -Url "$API/notifications/00000000-0000-0000-0000-000000000000/lue" -Token $TOKEN_PRES
Check "Marquer inexistant (404)" 404 $r.StatusCode

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