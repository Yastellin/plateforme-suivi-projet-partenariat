import { randomUUID } from 'crypto';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { RepairLegacySubmissionActivity1793500000000 } from '../src/database/migrations/1793500000000-RepairLegacySubmissionActivity';

describe('Réparation des anciennes soumissions (e2e)', () => {
  let ctx: ApplicationTest;

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  it("rétablit la provenance, le nom de l'établissement et l'activité de création", async () => {
    const [compte] = await ctx.dataSource.query(
      `SELECT id, etablissement_id
       FROM "Utilisateur"
       WHERE role = 'ETABLISSEMENT' AND etablissement_id IS NOT NULL
       ORDER BY email
       LIMIT 1`,
    );
    const [etablissement] = await ctx.dataSource.query(
      `SELECT id, nom FROM "Etablissement" WHERE id = $1`,
      [compte.etablissement_id],
    );
    const [projet] = await ctx.dataSource.query(
      `SELECT id, nom
       FROM "Projet"
       WHERE etablissement_id = $1
       ORDER BY created_at
       LIMIT 1`,
      [compte.etablissement_id],
    );
    const [destinataire] = await ctx.dataSource.query(
      `SELECT id FROM "Utilisateur" WHERE role = 'PRESIDENCE' LIMIT 1`,
    );

    await ctx.dataSource.query(
      `DELETE FROM "HistoriqueAction"
       WHERE entite_type = 'Projet' AND entite_id = $1`,
      [projet.id],
    );
    await ctx.dataSource.query(
      `UPDATE "Projet"
       SET soumis_le = NULL,
           cree_par_role = 'PRESIDENCE',
           cree_par_utilisateur_id = $2
       WHERE id = $1`,
      [projet.id, compte.id],
    );

    const notificationId = randomUUID();
    await ctx.dataSource.query(
      `INSERT INTO "Notification" (
         id, titre, message, type, priorite, date_creation, est_lue,
         utilisateur_id, reference_type, reference_id, created_at, updated_at
       ) VALUES (
         $1, 'Projet soumis', 'Un projet a été soumis.', 'PROJET_SOUMIS',
         'HAUTE', '2025-05-14T08:30:00.000Z', false, $2, 'Projet', $3,
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
       )`,
      [notificationId, destinataire.id, projet.id],
    );

    const queryRunner = ctx.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await new RepairLegacySubmissionActivity1793500000000().up(queryRunner);
    } finally {
      await queryRunner.release();
    }

    const [projetRepare] = await ctx.dataSource.query(
      `SELECT soumis_le, cree_par_role
       FROM "Projet"
       WHERE id = $1`,
      [projet.id],
    );
    expect(projetRepare.soumis_le).not.toBeNull();
    expect(projetRepare.cree_par_role).toBe('ETABLISSEMENT');

    const [notification] = await ctx.dataSource.query(
      `SELECT message FROM "Notification" WHERE id = $1`,
      [notificationId],
    );
    expect(notification.message).toContain(
      `l’établissement « ${etablissement.nom} »`,
    );

    const [creation] = await ctx.dataSource.query(
      `SELECT utilisateur_id, action
       FROM "HistoriqueAction"
       WHERE entite_type = 'Projet'
         AND entite_id = $1
         AND action = 'CREATION'`,
      [projet.id],
    );
    expect(creation).toMatchObject({
      utilisateur_id: compte.id,
      action: 'CREATION',
    });
  });
});
