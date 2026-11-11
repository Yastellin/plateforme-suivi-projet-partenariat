Attribute VB_Name = "NumerotationRapport"
Option Explicit

'=====================================================================
' MODULE  : NumerotationRapport
' OBJET   : numerotation des pages et traitement des legendes vides
' VERSION : 1.0 - 7 novembre 2026
' WORD    : 2016, 2019, 2021, Microsoft 365 (Windows)
'
' PRINCIPE
'   Le document doit contenir exactement 4 sections :
'     1. page de garde -> avant-propos        (aucun numero)
'     2. remerciements -> sommaire            (romain majuscule, I..)
'     3. introduction -> conclusion           (arabe, 1..)
'     4. bibliographie -> fin du document     (romain majuscule, reprise)
'
'   La macro ne devine pas les titres : elle travaille sur les sections
'   existantes. Utiliser d'abord CreerQuatreSections sur un document
'   qui ne contient qu'une section, ou la copie corrigee fournie.
'
' IMPORTANT
'   - Toujours travailler sur une copie.
'   - Les numeros sont des champs PAGE, jamais du texte tape.
'   - Apres toute modification du sommaire, relancer RecalerRepriseRomaine.
'=====================================================================

'---------------------------------------------------------------------
' 1. PARAMETRES MODIFIABLES
'---------------------------------------------------------------------
Public Const TITRE_REMERCIEMENTS As String = "REMERCIEMENTS"
Public Const TITRE_INTRODUCTION As String = "INTRODUCTION"
Public Const TITRE_BIBLIOGRAPHIE As String = "BIBLIOGRAPHIE"

' Formats acceptes : "RomainMajuscule", "RomainMinuscule", "Arabe", "Aucun"
Public Const FORMAT_LIMINAIRES As String = "RomainMajuscule"
Public Const FORMAT_CORPS As String = "Arabe"
Public Const FORMAT_BIBLIO As String = "RomainMajuscule"

' Positions acceptees : "Haut", "Bas", "HautDroite", "BasDroite"
Public Const POSITION_LIMINAIRES As String = "Bas"
Public Const POSITION_CORPS As String = "Bas"
Public Const POSITION_BIBLIO As String = "Haut"

Public Const DEPART_LIMINAIRES As Long = 1
Public Const DEPART_CORPS As Long = 1

' 0 = calcul automatique : (nombre de pages de la section 2) + 1
Public Const DEPART_BIBLIO_AUTO As Long = 0

' Mettre par exemple 12 pour imposer XII, sinon laisser 0.
Public Const DEPART_BIBLIO_FORCE As Long = 0

' Style applique aux legendes vides en mode EXCLURE

'---------------------------------------------------------------------
' 2. MACRO PRINCIPALE
'---------------------------------------------------------------------
Public Sub ConfigurerPaginationRapport()
    Dim doc As Document
    Dim departBiblio As Long

    On Error GoTo Erreur
    Set doc = ActiveDocument

    If doc.Sections.Count <> 4 Then
        MsgBox "Ce rapport doit contenir exactement 4 sections." & vbCrLf & _
               "Sections trouvees : " & doc.Sections.Count & vbCrLf & vbCrLf & _
               "Utilisez la copie corrigee ou la macro CreerQuatreSections", _
               vbExclamation, "Structure incorrecte"
        Exit Sub
    End If

    If MsgBox("Configurer la numerotation des 4 sections ?" & vbCrLf & _
              "Une sauvegarde prealable est conseillee.", _
              vbYesNo + vbQuestion, "Numerotation du rapport") <> vbYes Then
        Exit Sub
    End If

    Application.ScreenUpdating = False
    Application.UndoRecord.StartCustomRecord "Numerotation du rapport"

    ' Section 1 : aucune numero visible
    ConfigurerUneSection doc.Sections(1), "Aucun", 0, "Aucun"

    ' Section 2 : remerciements -> sommaire
    ConfigurerUneSection doc.Sections(2), FORMAT_LIMINAIRES, DEPART_LIMINAIRES, POSITION_LIMINAIRES

    ' Section 3 : introduction -> conclusion
    ConfigurerUneSection doc.Sections(3), FORMAT_CORPS, DEPART_CORPS, POSITION_CORPS

    ' Section 4 : bibliographie -> fin
    If DEPART_BIBLIO_FORCE > 0 Then
        departBiblio = DEPART_BIBLIO_FORCE
    Else
        departBiblio = CompterPagesSection(doc.Sections(2)) + 1
    End If
    ConfigurerUneSection doc.Sections(4), FORMAT_BIBLIO, departBiblio, POSITION_BIBLIO

    MettreAJourTousLesChamps doc

    Application.UndoRecord.EndCustomRecord
    Application.ScreenUpdating = True

    VerifierPagination doc
    Exit Sub

Erreur:
    Application.ScreenUpdating = True
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical, "Numerotation"
End Sub

'---------------------------------------------------------------------
' 3. CONFIGURATION D'UNE SECTION
'---------------------------------------------------------------------
Private Sub ConfigurerUneSection(ByVal sec As Section, _
                                 ByVal fmt As String, _
                                 ByVal depart As Long, _
                                 ByVal position As String)
    Dim hf As HeaderFooter

    ' Desactiver les variantes qui masquent le numero sur certaines pages
    sec.PageSetup.DifferentFirstPageHeaderFooter = False
    sec.PageSetup.OddAndEvenPagesHeaderFooter = False

    ' Delier tous les en-tetes et pieds de page, puis vider
    For Each hf In sec.Headers
        hf.LinkToPrevious = False
        ViderHeaderFooter hf
    Next hf
    For Each hf In sec.Footers
        hf.LinkToPrevious = False
        ViderHeaderFooter hf
    Next hf

    ' Format de numerotation
    Select Case fmt
        Case "RomainMajuscule"
            sec.PageNumbers.NumberStyle = wdPageNumberStyleUppercaseRoman
        Case "RomainMinuscule"
            sec.PageNumbers.NumberStyle = wdPageNumberStyleLowercaseRoman
        Case "Arabe"
            sec.PageNumbers.NumberStyle = wdPageNumberStyleArabic
        Case "Aucun"
            ' On ne touche pas au format : aucun champ ne sera affiche.
        Case Else
            MsgBox "Format inconnu : " & fmt, vbExclamation
    End Select

    ' Valeur de depart
    If fmt <> "Aucun" And depart > 0 Then
        sec.PageNumbers.RestartNumberingAtSection = True
        sec.PageNumbers.StartingNumber = depart
    ElseIf fmt = "Aucun" Then
        sec.PageNumbers.RestartNumberingAtSection = False
    End If

    ' Champ PAGE dans l'en-tete ou le pied de page
    If fmt <> "Aucun" Then
        Select Case position
            Case "Haut"
                AjouterChampPAGE sec.Headers(wdHeaderFooterPrimary), wdAlignParagraphCenter
            Case "HautDroite"
                AjouterChampPAGE sec.Headers(wdHeaderFooterPrimary), wdAlignParagraphRight
            Case "Bas"
                AjouterChampPAGE sec.Footers(wdHeaderFooterPrimary), wdAlignParagraphCenter
            Case "BasDroite"
                AjouterChampPAGE sec.Footers(wdHeaderFooterPrimary), wdAlignParagraphRight
            Case "Aucun"
                ' rien
            Case Else
                MsgBox "Position inconnue : " & position, vbExclamation
        End Select
    End If
End Sub

Private Sub ViderHeaderFooter(ByVal hf As HeaderFooter)
    ' Supprime uniquement les champs PAGE : les logos, titres courants et
    ' autres textes fixes de l'en-tete ou du pied de page sont preserves.
    Dim i As Long

    On Error Resume Next
    For i = hf.Range.Fields.Count To 1 Step -1
        If EstChampPAGE(hf.Range.Fields(i).Code) Then
            hf.Range.Fields(i).Delete
        End If
    Next i
    On Error GoTo 0
End Sub

Private Sub AjouterChampPAGE(ByVal hf As HeaderFooter, _
                             ByVal alignement As WdParagraphAlignment)
    Dim r As Range

    ' Si l'en-tete/pied ne contient que des marques de paragraphe,
    ' on utilise le premier paragraphe ; sinon on ajoute une ligne.
    If Len(Trim$(Replace(hf.Range.Text, Chr$(13), ""))) = 0 Then
        Set r = hf.Range
    Else
        Set r = hf.Range.Paragraphs.Add.Range
    End If

    r.ParagraphFormat.Alignment = alignement
    r.Collapse wdCollapseStart
    hf.Range.Fields.Add Range:=r, Type:=wdFieldPage
End Sub

'---------------------------------------------------------------------
' 4. COMPTAGE DES PAGES D'UNE SECTION
'---------------------------------------------------------------------
Public Function CompterPagesSection(ByVal sec As Section) As Long
    Dim pDeb As Long
    Dim pFin As Long

    On Error GoTo Erreur

    pDeb = sec.Range.Paragraphs(1).Range.Information(wdActiveEndPageNumber)

    With sec.Range.Paragraphs(sec.Range.Paragraphs.Count).Range
        pFin = .Information(wdActiveEndPageNumber)
    End With

    If pFin < pDeb Then pFin = pDeb
    CompterPagesSection = pFin - pDeb + 1
    Exit Function

Erreur:
    CompterPagesSection = 0
End Function

'---------------------------------------------------------------------
' 5. RECALAGE DE LA REPRISE ROMAINE
'---------------------------------------------------------------------
Public Sub RecalerRepriseRomaine()
    Dim doc As Document
    Dim nbPages As Long
    Dim depart As Long

    On Error GoTo Erreur
    Set doc = ActiveDocument

    If doc.Sections.Count < 4 Then
        MsgBox "Le document doit comporter 4 sections.", vbExclamation
        Exit Sub
    End If

    nbPages = CompterPagesSection(doc.Sections(2))
    If nbPages < 1 Then
        MsgBox "Impossible de compter les pages de la section 2." & vbCrLf & _
               "Verifiez que le document est affiche en mode Page.", vbExclamation
        Exit Sub
    End If

    depart = nbPages + 1

    With doc.Sections(4).PageNumbers
        .RestartNumberingAtSection = True
        .StartingNumber = depart
    End With

    MettreAJourTousLesChamps doc

    MsgBox "Section 2 (remerciements -> sommaire) : " & nbPages & " page(s)." & vbCrLf & _
           "La section 4 (bibliographie) redemarre donc a " & depart & _
           " (" & EnRomain(depart) & ")." & vbCrLf & vbCrLf & _
           "Consequence : la bibliographie affiche " & EnRomain(depart) & _
           ", " & EnRomain(depart + 1) & ", etc.", _
           vbInformation, "Reprise romaine recalee"
    Exit Sub

Erreur:
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical
End Sub

'---------------------------------------------------------------------
' 6. VERIFICATION DE LA PAGINATION
'---------------------------------------------------------------------
Public Sub VerifierPagination(Optional ByVal doc As Document)
    Dim sec As Section
    Dim i As Long
    Dim n As Long
    Dim dep As Long
    Dim msg As String

    On Error GoTo Erreur
    If doc Is Nothing Then Set doc = ActiveDocument

    msg = "SECTION | PAGES | FORMAT | DEPART | DERNIER | EN-TETE | PIED" & vbCrLf
    msg = msg & String(78, "-") & vbCrLf

    For i = 1 To doc.Sections.Count
        Set sec = doc.Sections(i)
        n = CompterPagesSection(sec)
        dep = sec.PageNumbers.StartingNumber

        msg = msg & i & " | " & n & " | " & _
              NomFormat(sec.PageNumbers.NumberStyle) & " | " & dep & " | " & _
              DernierNumero(dep, n, sec.PageNumbers.NumberStyle) & " | " & _
              EtatChampPAGE(sec.Headers(wdHeaderFooterPrimary)) & " | " & _
              EtatChampPAGE(sec.Footers(wdHeaderFooterPrimary)) & vbCrLf
    Next i

    msg = msg & vbCrLf & "Attendu :" & vbCrLf & _
          "  section 1 : aucun numero (page de garde + avant-propos)" & vbCrLf & _
          "  section 2 : I a XI en pied centre (11 pages)" & vbCrLf & _
          "  section 3 : 1 a N en pied centre" & vbCrLf & _
          "  section 4 : XII et suivants en en-tete centre"

    MsgBox msg, vbInformation, "Verification de la pagination"
    Exit Sub

Erreur:
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical
End Sub

'---------------------------------------------------------------------
' 7. DIAGNOSTIC DES LEGENDES VIDES
'---------------------------------------------------------------------
Public Sub DiagnostiquerLegendesVides()
    Dim doc As Document
    Dim p As Paragraph
    Dim s As String
    Dim rapport As String
    Dim nVides As Long
    Dim nTotal As Long
    Dim nSeq As Long

    On Error GoTo Erreur
    Set doc = ActiveDocument

    rapport = "DIAGNOSTIC DES LEGENDES DE FIGURES" & vbCrLf & _
              "Document : " & doc.Name & vbCrLf & _
              String(72, "=") & vbCrLf & vbCrLf

    For Each p In doc.Paragraphs
        s = NettoyerTexte(p.Range.Text)
        If EstLegendeFigure(p, s) Then
            nTotal = nTotal + 1
            If ContientSEQFigure(p) Then nSeq = nSeq + 1

            If EstLegendeVide(s) Then
                nVides = nVides + 1
                rapport = rapport & "Legende vide n" & nVides & vbCrLf & _
                          "  Page      : " & p.Range.Information(wdActiveEndPageNumber) & vbCrLf & _
                          "  Style     : " & p.Style.NameLocal & vbCrLf & _
                          "  Texte     : [" & s & "]" & vbCrLf & _
                          "  Champ SEQ : " & IIf(ContientSEQFigure(p), "oui", "non") & vbCrLf & vbCrLf
            End If
        End If
    Next p

    rapport = rapport & String(72, "-") & vbCrLf & _
              "Legendes de figures detectees : " & nTotal & vbCrLf & _
              "Dont avec champ SEQ Figure    : " & nSeq & vbCrLf & _
              "Dont vides                    : " & nVides & vbCrLf & vbCrLf & _
              "Rappel : les entrees de la liste des figures (avec tabulation)" & vbCrLf & _
              "sont ignorees. Une legende vide contient un numero mais aucun" & vbCrLf & _
              "texte apres le separateur (deux-points ou tiret)."

    AfficherRapport rapport
    Exit Sub

Erreur:
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical
End Sub

Private Function EstLegendeFigure(ByVal p As Paragraph, ByVal s As String) As Boolean
    Dim st As String
    Dim motLegende As String

    st = LCase$(p.Style.NameLocal)
    ' "legende" construit avec ChrW pour rester en ASCII dans le fichier .bas.
    motLegende = LCase$("L" & ChrW(&HE9) & "gende")

    If InStr(st, motLegende) > 0 Then
        If InStr(st, "tableau") = 0 Then EstLegendeFigure = True
        Exit Function
    End If

    If InStr(st, "caption") > 0 Then
        If LCase$(Left$(s, 6)) = "figure" Then EstLegendeFigure = True
        Exit Function
    End If

    ' Une entree de liste manuelle contient une tabulation avant le numero de page.
    If InStr(p.Range.Text, Chr$(9)) > 0 Then Exit Function

    If LCase$(Left$(s, 6)) = "figure" Then EstLegendeFigure = True
End Function

Private Function EstLegendeVide(ByVal s As String) As Boolean
    Static re As Object

    If re Is Nothing Then
        Set re = CreateObject("VBScript.RegExp")
        re.Global = False
        re.IgnoreCase = True
        re.Pattern = "^\s*Figure\s*([0-9]+([.\-][0-9]+)?[a-zA-Z]?)?\s*[:\-" & _
                     ChrW(&H2013) & ChrW(&H2014) & "]?\s*$"
    End If

    EstLegendeVide = re.Test(s)
End Function

Private Function ContientSEQFigure(ByVal p As Paragraph) As Boolean
    Dim f As Field

    For Each f In p.Range.Fields
        If InStr(UCase$(f.Code), "SEQ FIGURE") > 0 Then
            ContientSEQFigure = True
            Exit Function
        End If
    Next f
End Function

Private Sub AfficherRapport(ByVal texte As String)
    Dim rep As Document

    Set rep = Documents.Add
    rep.Content.Text = texte
    rep.Content.Font.Name = "Consolas"
    rep.Content.Font.Size = 9
    rep.Paragraphs(1).Range.Font.Bold = True
    rep.Paragraphs(1).Range.Font.Size = 12
End Sub

'---------------------------------------------------------------------
' 8. TRAITEMENT DES LEGENDES VIDES
'    mode = "SUPPRIMER", "COMPLETER", "MASQUER" ou "EXCLURE"
'---------------------------------------------------------------------
Public Sub TraiterLegendesVides(ByVal mode As String)
    Dim doc As Document
    Dim i As Long
    Dim p As Paragraph
    Dim s As String
    Dim n As Long

    On Error GoTo Erreur
    Set doc = ActiveDocument
    mode = UCase$(Trim$(mode))

    If mode <> "SUPPRIMER" And mode <> "COMPLETER" And _
       mode <> "MASQUER" And mode <> "EXCLURE" Then
        MsgBox "Mode inconnu : " & mode & vbCrLf & _
               "Utilisez SUPPRIMER, COMPLETER, MASQUER ou EXCLURE.", _
               vbExclamation, "Traitement des legendes"
        Exit Sub
    End If

    If MsgBox("Appliquer le mode """ & mode & """ a toutes les legendes vides ?" & vbCrLf & _
              "Sauvegardez le document avant de continuer.", _
              vbYesNo + vbQuestion, "Traitement des legendes") <> vbYes Then
        Exit Sub
    End If

    Application.ScreenUpdating = False
    Application.UndoRecord.StartCustomRecord "Traitement des legendes vides"

    ' Parcours descendant : indispensable pour les suppressions.
    For i = doc.Paragraphs.Count To 1 Step -1
        Set p = doc.Paragraphs(i)
        s = NettoyerTexte(p.Range.Text)

        If EstLegendeFigure(p, s) And EstLegendeVide(s) Then
            Select Case mode
                Case "SUPPRIMER"
                    p.Range.Delete
                    n = n + 1
                Case "COMPLETER"
                    CompleterLegende p
                    n = n + 1
                Case "MASQUER"
                    MasquerLegende p
                    n = n + 1
                Case "EXCLURE"
                    ExclureLegende doc, p
                    n = n + 1
            End Select
        End If
    Next i

    Application.UndoRecord.EndCustomRecord
    Application.ScreenUpdating = True

    MettreAJourTousLesChamps doc

    If mode = "SUPPRIMER" Then
        MsgBox n & " legende(s) supprimee(s)." & vbCrLf & vbCrLf & _
               "Les numeros des figures suivantes peuvent avoir change." & vbCrLf & _
               "Verifiez la table des figures et les renvois (Ctrl+A puis F9).", _
               vbInformation, "Legendes vides"
    ElseIf mode = "EXCLURE" Then
        MsgBox n & " legende(s) marquee(s) """ & NomStyleExclue() & """." & vbCrLf & vbCrLf & _
               "Une table des figures fondee sur le style est necessaire" & vbCrLf & _
               "(champ TOC \t ...). Avec une table fondee sur \c ""Figure""," & vbCrLf & _
               "l'entree peut subsister.", _
               vbInformation, "Legendes vides"
    Else
        MsgBox n & " legende(s) traitee(s) en mode " & mode & ".", _
               vbInformation, "Legendes vides"
    End If
    Exit Sub

Erreur:
    Application.ScreenUpdating = True
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical
End Sub

Private Sub CompleterLegende(ByVal p As Paragraph)
    Dim r As Range

    If InStr(1, p.Range.Text, "compl" & ChrW(&HE9) & "ter", vbTextCompare) > 0 Then Exit Sub

    Set r = p.Range
    If r.End > r.Start Then r.End = r.End - 1   ' exclut la marque de paragraphe
    r.InsertAfter " [" & ChrW(&HE0) & " compl" & ChrW(&HE9) & "ter]"
End Sub

Private Sub MasquerLegende(ByVal p As Paragraph)
    Dim r As Range

    Set r = p.Range
    If r.End > r.Start Then r.End = r.End - 1   ' on garde la marque visible
    r.Font.Hidden = True
End Sub

Private Sub ExclureLegende(ByVal doc As Document, ByVal p As Paragraph)
    Dim st As Style

    On Error Resume Next
    Set st = doc.Styles(NomStyleExclue())
    On Error GoTo 0

    If st Is Nothing Then
        Set st = doc.Styles.Add(Name:=NomStyleExclue(), Type:=wdStyleTypeParagraph)
        st.BaseStyle = p.Style.NameLocal
        st.Font.Hidden = False
    End If

    p.Style = st
End Sub

'---------------------------------------------------------------------
' 9. MISE A JOUR DES CHAMPS
'---------------------------------------------------------------------
Public Sub MettreAJourTousLesChamps(Optional ByVal doc As Document)
    Dim sec As Section
    Dim hf As HeaderFooter
    Dim toc As TableOfContents
    Dim tof As TableOfFigures

    If doc Is Nothing Then Set doc = ActiveDocument

    On Error Resume Next

    doc.Fields.Update

    For Each sec In doc.Sections
        For Each hf In sec.Headers
            hf.Range.Fields.Update
        Next hf
        For Each hf In sec.Footers
            hf.Range.Fields.Update
        Next hf
    Next sec

    For Each toc In doc.TablesOfContents
        toc.Update
    Next toc

    For Each tof In doc.TablesOfFigures
        tof.Update
    Next tof

    On Error GoTo 0
End Sub

'---------------------------------------------------------------------
' 10. CREATION DES QUATRE SECTIONS (document a une seule section)
'---------------------------------------------------------------------
Public Sub CreerQuatreSections()
    Dim doc As Document

    On Error GoTo Erreur
    Set doc = ActiveDocument

    If doc.Sections.Count > 1 Then
        MsgBox "Le document contient deja " & doc.Sections.Count & " sections." & vbCrLf & vbCrLf & _
               "Cette macro ne s'utilise que sur un document a une seule section." & vbCrLf & _
               "Pour un document a 9 sections, utilisez la copie corrigee ou" & vbCrLf & _
               "supprimez manuellement les sauts de section (voir guide).", _
               vbExclamation, "Structure existante"
        Exit Sub
    End If

    If MsgBox("Creer 4 sections a partir des titres REMERCIEMENTS, INTRODUCTION" & vbCrLf & _
              "et BIBLIOGRAPHIE ? Verifiez ensuite qu'aucune page blanche n'a ete ajoutee.", _
              vbYesNo + vbQuestion, "Creation des sections") <> vbYes Then
        Exit Sub
    End If

    InsererSautSectionAvant doc, TITRE_REMERCIEMENTS
    InsererSautSectionAvant doc, TITRE_INTRODUCTION
    InsererSautSectionAvant doc, TITRE_BIBLIOGRAPHIE

    MsgBox "4 sections creees. Lancez maintenant ConfigurerPaginationRapport.", _
           vbInformation, "Creation des sections"
    Exit Sub

Erreur:
    MsgBox "Erreur " & Err.Number & " : " & Err.Description, vbCritical
End Sub

Private Sub InsererSautSectionAvant(ByVal doc As Document, ByVal titre As String)
    Dim p As Paragraph
    Dim r As Range

    Set p = TrouverParagrapheTitre(doc, titre)
    If p Is Nothing Then
        MsgBox "Titre introuvable : " & titre, vbExclamation
        Exit Sub
    End If

    Set r = p.Range
    r.Collapse wdCollapseStart
    r.InsertBreak Type:=wdSectionBreakNextPage
End Sub

Private Function TrouverParagrapheTitre(ByVal doc As Document, ByVal titre As String) As Paragraph
    Dim p As Paragraph

    For Each p In doc.Paragraphs
        If StrComp(NettoyerTexte(p.Range.Text), titre, vbTextCompare) = 0 Then
            Set TrouverParagrapheTitre = p
            Exit Function
        End If
    Next p
End Function

'---------------------------------------------------------------------
' 11. OUTILS
'---------------------------------------------------------------------
Private Function NettoyerTexte(ByVal s As String) As String
    s = Replace(s, Chr$(13), "")
    s = Replace(s, Chr$(7), "")
    s = Replace(s, Chr$(12), "")
    s = Replace(s, Chr$(160), " ")
    s = Replace(s, vbTab, " ")
    NettoyerTexte = Trim$(s)
End Function

Private Function NomStyleExclue() As String
    ' Construit le nom du style sans caractere non ASCII dans le fichier .bas.
    NomStyleExclue = "L" & ChrW(&HE9) & "gende exclue"
End Function

Private Function NomFormat(ByVal style As WdPageNumberStyle) As String
    Select Case style
        Case wdPageNumberStyleArabic: NomFormat = "Arabe"
        Case wdPageNumberStyleUppercaseRoman: NomFormat = "Romain maj."
        Case wdPageNumberStyleLowercaseRoman: NomFormat = "Romain min."
        Case wdPageNumberStyleUppercaseLetter: NomFormat = "Lettre maj."
        Case wdPageNumberStyleLowercaseLetter: NomFormat = "Lettre min."
        Case Else: NomFormat = "Autre (" & style & ")"
    End Select
End Function

Private Function DernierNumero(ByVal depart As Long, ByVal nbPages As Long, _
                               ByVal style As WdPageNumberStyle) As String
    Dim n As Long

    If nbPages < 1 Then
        DernierNumero = "-"
        Exit Function
    End If

    n = depart + nbPages - 1

    Select Case style
        Case wdPageNumberStyleUppercaseRoman
            DernierNumero = EnRomain(n)
        Case wdPageNumberStyleLowercaseRoman
            DernierNumero = LCase$(EnRomain(n))
        Case Else
            DernierNumero = CStr(n)
    End Select
End Function

Private Function EtatChampPAGE(ByVal hf As HeaderFooter) As String
    Dim f As Field

    If hf.Range.Fields.Count = 0 Then
        EtatChampPAGE = "aucun"
        Exit Function
    End If

    For Each f In hf.Range.Fields
        If EstChampPAGE(f.Code) Then
            EtatChampPAGE = "PAGE"
            Exit Function
        End If
    Next f

    EtatChampPAGE = "autre"
End Function

Private Function EstChampPAGE(ByVal code As String) As Boolean
    Dim c As String

    c = UCase$(Trim$(code))
    EstChampPAGE = (c = "PAGE") Or (Left$(c, 5) = "PAGE ")
End Function

Public Function EnRomain(ByVal n As Long) As String
    Dim valeurs As Variant
    Dim symboles As Variant
    Dim i As Long
    Dim res As String

    valeurs = Array(1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1)
    symboles = Array("M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I")

    res = ""
    For i = LBound(valeurs) To UBound(valeurs)
        Do While n >= valeurs(i)
            res = res & symboles(i)
            n = n - valeurs(i)
        Loop
    Next i

    EnRomain = res
End Function
