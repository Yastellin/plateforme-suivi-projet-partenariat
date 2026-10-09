# test-mot-de-passe-oublie.ps1
$baseUrl = "http://localhost:3000/api"
$email = "presidence@univ-fianarantsoa.mg"
$total = 0
$reussis = 0

function Tester($nom, $condition) {
    $script:total++
    if ($condition) {
        Write-Host "[OK] $nom" -ForegroundColor Green
        $script:reussis++
    } else {
        Write-Host "[KO] $nom" -ForegroundColor Red
    }
}

Write-Host "Tests mot de passe oublie - $baseUrl" -ForegroundColor Cyan

# 1. E-mail inconnu : reponse 200 + message generique (anti-enumeration)
$r1 = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/mot-de-passe-oublie" `
    -Body (@{ email = "inconnu-xyz@univ-fianarantsoa.mg" } | ConvertTo-Json) `
    -ContentType "application/json"
Tester "Email inconnu : status success" ($r1.status -eq "success")
Tester "Email inconnu : message generique" ($r1.data.message -match "Si un compte existe")

# 2. E-mail connu : reponse 200 identique
$r2 = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/mot-de-passe-oublie" `
    -Body (@{ email = $email } | ConvertTo-Json) `
    -ContentType "application/json"
Tester "Email connu : status success" ($r2.status -eq "success")
Tester "Email connu : meme message qu'inconnu" ($r2.data.message -eq $r1.data.message)

# 3. Payload invalide : e-mail malforme
try {
    Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/mot-de-passe-oublie" `
        -Body (@{ email = "pas-un-email" } | ConvertTo-Json) `
        -ContentType "application/json" | Out-Null
    Tester "Email invalide : doit renvoyer 400" $false
} catch {
    Tester "Email invalide : renvoie 400" ($_.Exception.Response.StatusCode.value__ -eq 400)
}

# 4. Reinitialiser avec token bidon
try {
    Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/reinitialiser-mot-de-passe" `
        -Body (@{ token = "token-bidon-1234567890"; nouveau_mot_de_passe = "ValidPass1" } | ConvertTo-Json) `
        -ContentType "application/json" | Out-Null
    Tester "Token bidon : doit renvoyer 400" $false
} catch {
    Tester "Token bidon : renvoie 400" ($_.Exception.Response.StatusCode.value__ -eq 400)
}

# 5. Mot de passe faible
try {
    Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/reinitialiser-mot-de-passe" `
        -Body (@{ token = "token-bidon-1234567890"; nouveau_mot_de_passe = "faible" } | ConvertTo-Json) `
        -ContentType "application/json" | Out-Null
    Tester "Mot de passe faible : doit renvoyer 400" $false
} catch {
    Tester "Mot de passe faible : renvoie 400" ($_.Exception.Response.StatusCode.value__ -eq 400)
}

# 6. Mot de passe sans majuscule
try {
    Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/reinitialiser-mot-de-passe" `
        -Body (@{ token = "token-bidon-1234567890"; nouveau_mot_de_passe = "sansmajuscule1" } | ConvertTo-Json) `
        -ContentType "application/json" | Out-Null
    Tester "Mot de passe sans majuscule : doit renvoyer 400" $false
} catch {
    Tester "Mot de passe sans majuscule : renvoie 400" ($_.Exception.Response.StatusCode.value__ -eq 400)
}

# 7. Rate limiting sur mot-de-passe-oublie (3/min)
Start-Sleep -Seconds 61
$bloque = $false
for ($i = 0; $i -lt 6; $i++) {
    try {
        Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/mot-de-passe-oublie" `
            -Body (@{ email = "rate-limit-$i@test.mg" } | ConvertTo-Json) `
            -ContentType "application/json" | Out-Null
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 429) {
            $bloque = $true
            break
        }
    }
}
Tester "Rate limiting : 429 apres 3 requetes" $bloque

Write-Host ""
Write-Host "Resultat : $reussis / $total" -ForegroundColor Cyan