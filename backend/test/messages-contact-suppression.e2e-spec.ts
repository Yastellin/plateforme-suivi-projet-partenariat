/**
 * Suppression des messages de contact : perimetre par role, notifications liees.
 */
import request from 'supertest';
import { creerApplicationTest, type ApplicationTest } from './harness/application-test';
import { enteteBearer } from './harness/jetons';
import { Notification } from '../src/notifications/entities/notification.entity';

const attendreNotifications = async (ctx: ApplicationTest, messageId: string) => {
  for (let i = 0; i < 50; i++) {
    const notifs = await ctx.dataSource.getRepository(Notification).find({
      where: { reference_type: 'MessageContact', reference_id: messageId },
    });
    if (notifs.length > 0) return notifs;
    await new Promise((r) => setTimeout(r, 100));
  }
  return [];
};

describe('Messages de contact - suppression (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let etablissementFds: any;
  let decideur: any;

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();
    const utilisateurs = await ctx.dataSource.query(
      `SELECT id, email, role, etablissement_id FROM "Utilisateur"`,
    );
    presidence = utilisateurs.find((u: any) => u.email.startsWith('presidence@'));
    etablissementFds = utilisateurs.find((u: any) => u.email.startsWith('fds@'));
    decideur = utilisateurs.find((u: any) => u.email.startsWith('president@'));
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  async function creerMessageGeneral(): Promise<string> {
    const r = await request(ctx.app.getHttpServer())
      .post('/api/public/contact')
      .send({
        nom: 'Jean Rakoto',
        email: 'jean.rakoto@example.mg',
        sujet: 'Message a supprimer',
        message: 'Bonjour, ce message sera supprime par la Presidence.',
      })
      .expect(201);
    return r.body.data.id;
  }

  it('refuse la suppression au DECIDEUR et a un etablissement sur un message qui ne lui est pas destine', async () => {
    const id = await creerMessageGeneral();
    await request(ctx.app.getHttpServer())
      .delete(`/api/messages-contact/${id}`)
      .set(...enteteBearer(decideur))
      .expect(403);
    await request(ctx.app.getHttpServer())
      .delete(`/api/messages-contact/${id}`)
      .set(...enteteBearer(etablissementFds))
      .expect(404);
  });

  it('supprime le message et ses notifications pour la Presidence', async () => {
    const id = await creerMessageGeneral();
    expect(await attendreNotifications(ctx, id)).not.toHaveLength(0);

    const r = await request(ctx.app.getHttpServer())
      .delete(`/api/messages-contact/${id}`)
      .set(...enteteBearer(presidence))
      .expect(200);
    expect(r.body.data).toEqual({ id, supprime: true });

    const restants = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM "MessageContact" WHERE id = $1`,
      [id],
    );
    expect(restants[0].total).toBe(0);
    const notifsRestantes = await ctx.dataSource.getRepository(Notification).count({
      where: { reference_type: 'MessageContact', reference_id: id },
    });
    expect(notifsRestantes).toBe(0);
  });

  it('renvoie 404 pour un message deja supprime', async () => {
    const id = await creerMessageGeneral();
    await request(ctx.app.getHttpServer())
      .delete(`/api/messages-contact/${id}`)
      .set(...enteteBearer(presidence))
      .expect(200);
    await request(ctx.app.getHttpServer())
      .delete(`/api/messages-contact/${id}`)
      .set(...enteteBearer(presidence))
      .expect(404);
  });
});
