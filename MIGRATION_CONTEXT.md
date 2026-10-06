# Contexte de migration Prisma vers TypeORM

## Objectif

Migrer l'intégralité du backend NestJS de Prisma vers TypeORM, sans changer :
- Les endpoints API (mêmes URLs, mêmes méthodes).
- Les formats de réponse (enveloppe ITDCMADA).
- Les règles métier (RG01 à RG44).
- Les permissions (Présidence, Établissement, Décideur).
- Les comportements (soft-delete, archivage, etc.).

## Stack cible

- Framework : NestJS 11
- ORM : TypeORM (avec @nestjs/typeorm)
- Base de données : PostgreSQL 16
- Pilote : pg

## Contraintes

- Aucun changement de contrat API.
- Aucun changement de comportement métier.
- Les tests PowerShell (`test-*.ps1`) doivent passer à l'identique.

## Ordre de migration

1. Auth (le plus simple)
2. Établissements
3. Partenaires + Contacts
4. Partenariats
5. Projets
6. Cotutelles
7. Documents
8. Conventions
9. Publications
10. Notifications
11. Tableau de bord + Statistiques
12. Référentiels
13. Archives + Recherche
14. Cleanup + Health

## Règles métier critiques

[Voir le cahier des charges pour RG01-RG44]