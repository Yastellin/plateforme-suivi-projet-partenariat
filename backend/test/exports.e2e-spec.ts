import request from 'supertest';
import { randomUUID } from 'crypto';
import { CreateExportHistorique1793900000000 } from '../src/database/migrations/1793900000000-CreateExportHistorique';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';

describe('Exports de données de la Présidence (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let decideur: any;

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();
    const utilisateurs = await ctx.dataSource.query(
      'SELECT id, email, role FROM "Utilisateur"',
    );
    presidence = utilisateurs.find((utilisateur: any) =>
      utilisateur.email.startsWith('presidence@'),
    );
    decideur = utilisateurs.find(
      (utilisateur: any) => utilisateur.role === 'DECIDEUR',
    );

    const requete = ctx.dataSource.createQueryRunner();
    await requete.connect();
    try {
      await new CreateExportHistorique1793900000000().up(requete);
    } finally {
      await requete.release();
    }
  }, 120000);

  afterAll(async () => {
    await ctx?.fermer();
  });

  const filtresTousStatuts = {
    portee: 'TOUT',
    periode: { mode: 'TOUT', champ_date: 'DEBUT' },
    statuts: ['EN_COURS', 'TERMINE', 'EN_RETARD', 'SUSPENDU', 'EXPIRE'],
    format: 'XLSX',
  };

  it('retourne un aperçu enveloppé avec les quatre compteurs et les formats', async () => {
    const reponse = await request(ctx.app.getHttpServer())
      .post('/api/exports/apercu')
      .set(...enteteBearer(presidence))
      .send(filtresTousStatuts)
      .expect(201);

    expect(reponse.body.status).toBe('success');
    expect(reponse.body.signature).toBe('ITDCMADA');
    expect(donnees<any>(reponse.body)).toEqual(
      expect.objectContaining({
        portee: 'TOUT',
        total_lignes: expect.any(Number),
        par_entite: {
          conventions: expect.any(Number),
          projets: expect.any(Number),
          partenariats: expect.any(Number),
          partenaires: expect.any(Number),
        },
        formats: expect.objectContaining({
          XLSX: expect.objectContaining({ nombre_fichiers: 1 }),
          PDF: expect.objectContaining({ nombre_fichiers: 1 }),
          CSV: expect.objectContaining({ nombre_fichiers: 5 }),
        }),
      }),
    );
  });

  it('applique les statuts réels par entité sans filtrer les partenaires', async () => {
    const reponse = await request(ctx.app.getHttpServer())
      .post('/api/exports/apercu')
      .set(...enteteBearer(presidence))
      .send({
        ...filtresTousStatuts,
        statuts: ['EN_COURS'],
      })
      .expect(201);

    expect(donnees<any>(reponse.body).par_entite).toEqual({
      conventions: 0,
      projets: 1,
      partenariats: 1,
      partenaires: 1,
    });
  });

  it('filtre les projets par l’année de leur date de début', async () => {
    const reponse = await request(ctx.app.getHttpServer())
      .post('/api/exports/apercu')
      .set(...enteteBearer(presidence))
      .send({
        ...filtresTousStatuts,
        portee: 'PROJETS',
        periode: { mode: 'ANNEE', champ_date: 'DEBUT', annee: 2025 },
      })
      .expect(201);

    expect(donnees<any>(reponse.body).par_entite.projets).toBe(2);
    expect(donnees<any>(reponse.body).par_entite.partenaires).toBe(0);
  });

  it('renvoie un aperçu vide si aucun statut générique n’est sélectionné', async () => {
    const reponse = await request(ctx.app.getHttpServer())
      .post('/api/exports/apercu')
      .set(...enteteBearer(presidence))
      .send({ ...filtresTousStatuts, statuts: [] })
      .expect(201);

    expect(donnees<any>(reponse.body).total_lignes).toBe(0);
    expect(donnees<any>(reponse.body).par_entite).toEqual({
      conventions: 0,
      projets: 0,
      partenariats: 0,
      partenaires: 0,
    });
  });

  it('refuse les rôles autres que la Présidence', async () => {
    await request(ctx.app.getHttpServer())
      .post('/api/exports/apercu')
      .set(...enteteBearer(decideur))
      .send(filtresTousStatuts)
      .expect(403);
  });

  it('rejette les filtres incomplets', async () => {
    const reponse = await request(ctx.app.getHttpServer())
      .post('/api/exports/apercu')
      .set(...enteteBearer(presidence))
      .send({ portee: 'TOUT', statuts: [], format: 'PDF' })
      .expect(400);

    expect(reponse.body.status).toBe('error');
    expect(reponse.body.signature).toBe('ITDCMADA');
  });

  it('valide les dates de l’intervalle avant la requête', async () => {
    const reponse = await request(ctx.app.getHttpServer())
      .post('/api/exports/apercu')
      .set(...enteteBearer(presidence))
      .send({
        ...filtresTousStatuts,
        periode: {
          mode: 'INTERVALLE',
          champ_date: 'FIN',
          du: '2026-06-20',
          au: '2026-06-01',
        },
      })
      .expect(400);

    expect(reponse.body.status).toBe('error');
    expect(reponse.body.signature).toBe('ITDCMADA');
  });

  it('télécharge un classeur binaire et enregistre l’export réussi', async () => {
    const fichier = await request(ctx.app.getHttpServer())
      .post('/api/exports')
      .set(...enteteBearer(presidence))
      .send(filtresTousStatuts)
      .expect(200);

    expect(fichier.headers['content-type']).toContain('spreadsheetml');
    expect(fichier.headers['content-disposition']).toContain('attachment;');
    expect(Number(fichier.headers['content-length'])).toBeGreaterThan(100);
    expect(fichier.body).not.toHaveProperty('status');

    const historique = await request(ctx.app.getHttpServer())
      .get('/api/exports/historique?page=1&limit=10')
      .set(...enteteBearer(presidence))
      .expect(200);
    const page = donnees<any>(historique.body);
    expect(page.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    expect(page.data[0]).toEqual(
      expect.objectContaining({
        utilisateur: presidence.email,
        portee: 'TOUT',
        format: 'XLSX',
        nombre_lignes: expect.any(Number),
      }),
    );
  });

  it('aligne les retards exportés sur les règles existantes et déduplique les unions', async () => {
    const maintenant = new Date();
    const datePasse = new Date(maintenant.getTime() - 24 * 60 * 60 * 1000);
    const finAujourdhui = new Date(maintenant);
    finAujourdhui.setHours(23, 59, 59, 999);
    if (finAujourdhui <= maintenant) {
      finAujourdhui.setDate(finAujourdhui.getDate() + 1);
    }
    const dateFutur = new Date(maintenant.getTime() + 24 * 60 * 60 * 1000);
    const prefixe = `EXPORT_REGLE_${randomUUID()}`;
    const etablissement = (
      await ctx.dataSource.query('SELECT id FROM "Etablissement" LIMIT 1')
    )[0];

    const projets = [
      { statut: 'EN_COURS', dateFin: datePasse },
      { statut: 'EN_COURS', dateFin: finAujourdhui },
      { statut: 'SUSPENDU', dateFin: datePasse },
      { statut: 'SUSPENDU', dateFin: dateFutur },
      { statut: 'TERMINE', dateFin: datePasse },
      { statut: 'BROUILLON', dateFin: datePasse },
      { statut: 'EXPIRE', dateFin: datePasse },
    ];
    for (const [index, projet] of projets.entries()) {
      await ctx.dataSource.query(
        `INSERT INTO "Projet" ("id", "nom", "type", "date_debut", "date_fin_prevue", "statut", "archive", "etablissement_id", "cree_par_role")
         VALUES ($1, $2, 'RECHERCHE', $3, $4, $5, false, $6, 'PRESIDENCE')`,
        [
          randomUUID(),
          `${prefixe}_PROJET_${index}`,
          datePasse,
          projet.dateFin,
          projet.statut,
          etablissement.id,
        ],
      );
    }
    await ctx.dataSource.query(
      `INSERT INTO "Projet" ("id", "nom", "type", "date_debut", "date_fin_prevue", "statut", "archive", "etablissement_id", "cree_par_role")
       VALUES ($1, $2, 'RECHERCHE', $3, $4, 'EN_COURS', true, $5, 'PRESIDENCE')`,
      [
        randomUUID(),
        `${prefixe}_PROJET_ARCHIVE`,
        datePasse,
        datePasse,
        etablissement.id,
      ],
    );

    const conventions = [
      { statut: 'ACTIVE', dateFin: datePasse },
      { statut: 'ACTIVE', dateFin: finAujourdhui },
      { statut: 'SUSPENDUE', dateFin: datePasse },
      { statut: 'SUSPENDUE', dateFin: dateFutur },
      { statut: 'BROUILLON', dateFin: datePasse },
      { statut: 'EN_ATTENTE_SIGNATURE', dateFin: datePasse },
      { statut: 'EXPIREE', dateFin: dateFutur },
    ];
    for (const [index, convention] of conventions.entries()) {
      await ctx.dataSource.query(
        `INSERT INTO "Convention" ("id", "reference", "titre", "date_fin", "statut", "archive")
         VALUES ($1, $2, $3, $4, $5, false)`,
        [
          randomUUID(),
          `${prefixe}_CONV_${index}`,
          `${prefixe}_CONVENTION_${index}`,
          convention.dateFin,
          convention.statut,
        ],
      );
    }
    await ctx.dataSource.query(
      `INSERT INTO "Convention" ("id", "reference", "titre", "date_fin", "statut", "archive")
       VALUES ($1, $2, $3, $4, 'ACTIVE', true)`,
      [
        randomUUID(),
        `${prefixe}_CONV_ARCHIVE`,
        `${prefixe}_CONVENTION_ARCHIVE`,
        datePasse,
      ],
    );

    const partenariats = [
      { statut: 'EN_COURS', dateFin: datePasse },
      { statut: 'EN_COURS', dateFin: finAujourdhui },
      { statut: 'SUSPENDU', dateFin: datePasse },
      { statut: 'SUSPENDU', dateFin: dateFutur },
      { statut: 'TERMINE', dateFin: datePasse },
      { statut: 'BROUILLON', dateFin: datePasse },
    ];
    for (const [index, partenariat] of partenariats.entries()) {
      await ctx.dataSource.query(
        `INSERT INTO "Partenariat" ("id", "intitule", "domaine", "date_debut", "date_fin", "statut", "archive")
         VALUES ($1, $2, 'RECHERCHE', $3, $4, $5, false)`,
        [
          randomUUID(),
          `${prefixe}_PARTENARIAT_${index}`,
          datePasse,
          partenariat.dateFin,
          partenariat.statut,
        ],
      );
    }
    await ctx.dataSource.query(
      `INSERT INTO "Partenariat" ("id", "intitule", "domaine", "date_debut", "date_fin", "statut", "archive")
       VALUES ($1, $2, 'RECHERCHE', $3, $4, 'SUSPENDU', true)`,
      [randomUUID(), `${prefixe}_PARTENARIAT_ARCHIVE`, datePasse, datePasse],
    );

    const apercu = async (portee: string, statuts: string[]) => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/exports/apercu')
        .set(...enteteBearer(presidence))
        .send({
          ...filtresTousStatuts,
          portee,
          periode: { mode: 'TOUT', champ_date: 'DEBUT' },
          statuts,
        })
        .expect(201);
      return donnees<any>(reponse.body).par_entite;
    };

    const projetsApi = await request(ctx.app.getHttpServer())
      .get('/api/projets?limit=100')
      .set(...enteteBearer(presidence))
      .expect(200);
    const projetsSource = donnees<any>(projetsApi.body).data.filter(
      (projet: any) => projet.nom.startsWith(`${prefixe}_PROJET_`),
    );
    const conventionsSource = conventions.map((convention) => ({
      ...convention,
      date_fin: convention.dateFin,
    }));
    const partenariatsSource = partenariats;
    const conventionsEnRetard = (
      convention: (typeof conventionsSource)[number],
    ) => convention.statut === 'EXPIREE' || convention.date_fin < new Date();

    const apercuProjetsRetard = await apercu('PROJETS', ['EN_RETARD']);
    expect(apercuProjetsRetard.projets).toBe(
      projetsSource.filter((projet: any) => projet.en_retard).length,
    );
    const apercuProjetsUnion = await apercu('PROJETS', [
      'EN_RETARD',
      'SUSPENDU',
    ]);
    expect(apercuProjetsUnion.projets).toBe(
      projetsSource.filter(
        (projet: any) => projet.en_retard || projet.statut === 'SUSPENDU',
      ).length,
    );

    const apercuConventionsRetard = await apercu('CONVENTIONS', ['EN_RETARD']);
    expect(apercuConventionsRetard.conventions).toBe(
      conventionsSource.filter(conventionsEnRetard).length,
    );
    const apercuConventionsUnion = await apercu('CONVENTIONS', [
      'EN_RETARD',
      'SUSPENDU',
    ]);
    expect(apercuConventionsUnion.conventions).toBe(
      conventionsSource.filter(
        (convention) =>
          conventionsEnRetard(convention) || convention.statut === 'SUSPENDUE',
      ).length,
    );

    const apercuPartenariatsRetard = await apercu('PARTENARIATS', [
      'EN_RETARD',
    ]);
    expect(apercuPartenariatsRetard.partenariats).toBe(0);
    const apercuPartenariatsUnion = await apercu('PARTENARIATS', [
      'EN_RETARD',
      'SUSPENDU',
    ]);
    expect(apercuPartenariatsUnion.partenariats).toBe(
      partenariatsSource.filter(
        (partenariat) => partenariat.statut === 'SUSPENDU',
      ).length,
    );
  });
});
