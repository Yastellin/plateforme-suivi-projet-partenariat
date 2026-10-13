// src/partenaires/contacts/dto/contact-response.dto.ts
//
// TODO : fichier actuellement vide (0 octet). ContactsService renvoie
// l'entite Contact brute (save/find) sans mapper vers un DTO de reponse,
// ce qui expose les colonnes internes (partenaire_id, created_at,
// updated_at) et ne garantit pas le contrat API unifie { status, message,
// data, errors, signature }. A remplir (id, nom, fonction, email,
// telephone) et a utiliser dans contacts.service.ts + contacts.controller.ts.
