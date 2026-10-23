import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Répare les données créées avant le suivi explicite de la provenance et de la
 * soumission, puis rend leur activité consultable par l'établissement auteur.
 * Aucun élément de schéma ni contrat exposé n'est modifié.
 */
export class RepairLegacySubmissionActivity1793500000000 implements MigrationInterface {
  name = 'RepairLegacySubmissionActivity1793500000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const ressources = [
      {
        table: 'Projet',
        entite: 'Projet',
        notification: 'PROJET_SOUMIS',
        libelle: 'nom',
      },
      {
        table: 'Partenaire',
        entite: 'Partenaire',
        notification: 'PARTENAIRE_SOUMIS',
        libelle: 'nom',
      },
      {
        table: 'Partenariat',
        entite: 'Partenariat',
        notification: 'PARTENARIAT_SOUMIS',
        libelle: 'intitule',
      },
    ] as const;

    for (const ressource of ressources) {
      // Les notifications et l'audit sont des preuves de soumission plus
      // fiables que le statut métier, qui peut également être choisi par la
      // Présidence pour ses propres données.
      await queryRunner.query(`
        WITH soumissions AS (
          SELECT reference_id AS entite_id, MIN(date_creation) AS date_soumission
          FROM "Notification"
          WHERE type::text = '${ressource.notification}'
            AND reference_type = '${ressource.entite}'
          GROUP BY reference_id
          UNION ALL
          SELECT entite_id, MIN(date_creation) AS date_soumission
          FROM "HistoriqueAction"
          WHERE action::text = 'SOUMISSION'
            AND entite_type = '${ressource.entite}'
            AND entite_id IS NOT NULL
          GROUP BY entite_id
        ), premiere_soumission AS (
          SELECT entite_id, MIN(date_soumission) AS date_soumission
          FROM soumissions
          GROUP BY entite_id
        )
        UPDATE "${ressource.table}" donnee
        SET soumis_le = premiere_soumission.date_soumission
        FROM premiere_soumission
        WHERE donnee.id::text = premiere_soumission.entite_id
          AND donnee.soumis_le IS NULL
      `);

      await queryRunner.query(`
        UPDATE "${ressource.table}"
        SET cree_par_role = 'ETABLISSEMENT'
        WHERE soumis_le IS NOT NULL
          AND cree_par_role IS DISTINCT FROM 'ETABLISSEMENT'
      `);

      await queryRunner.query(`
        WITH auteur AS (
          SELECT DISTINCT ON (entite_id)
            entite_id,
            utilisateur_id
          FROM "HistoriqueAction"
          WHERE action::text = 'SOUMISSION'
            AND entite_type = '${ressource.entite}'
            AND utilisateur_id IS NOT NULL
          ORDER BY entite_id, date_creation ASC
        )
        UPDATE "${ressource.table}" donnee
        SET cree_par_utilisateur_id = auteur.utilisateur_id
        FROM auteur
        WHERE donnee.id::text = auteur.entite_id
          AND donnee.cree_par_utilisateur_id IS NULL
      `);

      // Les créations déjà attribuées à un compte deviennent immédiatement
      // visibles dans l'historique de son établissement, sans inventer
      // d'auteur pour les anciennes lignes réellement anonymes.
      await queryRunner.query(`
        INSERT INTO "HistoriqueAction" (
          id,
          utilisateur_id,
          utilisateur_nom,
          utilisateur_role,
          action,
          entite_type,
          entite_id,
          entite_nom,
          details,
          date_creation
        )
        SELECT
          gen_random_uuid(),
          utilisateur.id,
          utilisateur.email,
          utilisateur.role::text,
          'CREATION',
          '${ressource.entite}',
          donnee.id::text,
          donnee."${ressource.libelle}",
          'Création antérieure ajoutée à l’historique',
          donnee.created_at
        FROM "${ressource.table}" donnee
        JOIN "Utilisateur" utilisateur
          ON utilisateur.id::text = donnee.cree_par_utilisateur_id
        WHERE NOT EXISTS (
          SELECT 1
          FROM "HistoriqueAction" historique
          WHERE historique.action::text = 'CREATION'
            AND historique.entite_type = '${ressource.entite}'
            AND historique.entite_id = donnee.id::text
        )
      `);
    }

    // Les notifications historiques sont reformulées avec le nom réel de
    // l'établissement, comme les nouvelles notifications du service.
    await queryRunner.query(`
      UPDATE "Notification" notification
      SET message = 'Le projet « ' || projet.nom ||
        ' » a été soumis par l’établissement « ' || etablissement.nom || ' ».',
        updated_at = CURRENT_TIMESTAMP
      FROM "Projet" projet
      JOIN "Etablissement" etablissement
        ON etablissement.id = projet.etablissement_id
      WHERE notification.type::text = 'PROJET_SOUMIS'
        AND notification.reference_type = 'Projet'
        AND notification.reference_id = projet.id::text
    `);

    await queryRunner.query(`
      UPDATE "Notification" notification
      SET message = 'Le partenaire « ' || partenaire.nom ||
        ' » a été soumis par l’établissement « ' || etablissement.nom || ' ».',
        updated_at = CURRENT_TIMESTAMP
      FROM "Partenaire" partenaire
      JOIN "Etablissement" etablissement
        ON etablissement.id = partenaire.etablissement_id
      WHERE notification.type::text = 'PARTENAIRE_SOUMIS'
        AND notification.reference_type = 'Partenaire'
        AND notification.reference_id = partenaire.id::text
    `);

    await queryRunner.query(`
      WITH etablissements_soumissionnaires AS (
        SELECT
          partenariat.id,
          partenariat.intitule,
          COALESCE(etablissement_auteur.nom, etablissement_lie.nom) AS nom
        FROM "Partenariat" partenariat
        LEFT JOIN "Utilisateur" auteur
          ON auteur.id::text = partenariat.cree_par_utilisateur_id
        LEFT JOIN "Etablissement" etablissement_auteur
          ON etablissement_auteur.id = auteur.etablissement_id
        LEFT JOIN LATERAL (
          SELECT etablissement.nom
          FROM "PartenariatEtablissement" lien
          JOIN "Etablissement" etablissement
            ON etablissement.id = lien.etablissement_id
          WHERE lien.partenariat_id = partenariat.id
          ORDER BY etablissement.nom ASC
          LIMIT 1
        ) etablissement_lie ON TRUE
      )
      UPDATE "Notification" notification
      SET message = 'Le partenariat « ' || source.intitule ||
        ' » a été soumis par l’établissement « ' || source.nom || ' ».',
        updated_at = CURRENT_TIMESTAMP
      FROM etablissements_soumissionnaires source
      WHERE notification.type::text = 'PARTENARIAT_SOUMIS'
        AND notification.reference_type = 'Partenariat'
        AND notification.reference_id = source.id::text
        AND source.nom IS NOT NULL
    `);
  }

  async down(): Promise<void> {
    // Réparation de données volontairement irréversible : revenir en arrière
    // ne doit ni effacer l'historique ni réintroduire des provenances erronées.
  }
}
