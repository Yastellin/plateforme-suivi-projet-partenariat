import { DocumentsService } from './documents.service';
import { TypeDocument } from '../common/enums/type-document.enum';

describe('DocumentsService', () => {
  const documents: any[] = [];
  const documentRepo = {
    findOne: jest.fn(({ where }: any) => {
      if (where.id) {
        return Promise.resolve(
          documents.find(
            (document) =>
              document.id === where.id &&
              (where.est_archive === undefined ||
                document.est_archive === where.est_archive),
          ) ?? null,
        );
      }

      const correspondants = documents.filter(
        (document) =>
          document.type === where.type &&
          document.nom_fichier === where.nom_fichier &&
          document.projet_id === where.projet_id &&
          (where.est_archive === undefined ||
            document.est_archive === where.est_archive),
      );
      return Promise.resolve(
        correspondants.sort((a, b) => b.version - a.version)[0] ?? null,
      );
    }),
    find: jest.fn(({ where }: any) =>
      Promise.resolve(
        documents.filter(
          (document) =>
            document.type === where.type &&
            document.nom_fichier === where.nom_fichier &&
            document.projet_id === where.projet_id,
        ),
      ),
    ),
    update: jest.fn((id: string, valeurs: any) => {
      const document = documents.find((element) => element.id === id);
      if (document) Object.assign(document, valeurs);
      return Promise.resolve(undefined);
    }),
    create: jest.fn((valeurs: any) => valeurs),
    save: jest.fn((document: any) => {
      const enregistre = {
        ...document,
        id: `document-${documents.length + 1}`,
        created_at: new Date(),
        updated_at: new Date(),
      };
      documents.push(enregistre);
      return Promise.resolve(enregistre);
    }),
  };
  const projetRepo = {
    findOne: jest.fn().mockResolvedValue({ id: 'projet-1' }),
  };
  const depot = {
    enregistrer: jest.fn().mockResolvedValue('/fichiers/document'),
  };
  const historique = { enregistrer: jest.fn().mockResolvedValue(undefined) };

  let service: DocumentsService;

  beforeEach(() => {
    documents.length = 0;
    jest.clearAllMocks();
    service = new DocumentsService(
      documentRepo as any,
      projetRepo as any,
      {} as any,
      {} as any,
      {} as any,
      depot as any,
      historique as any,
    );
  });

  async function ajouter(nomFichier: string) {
    return service.upload({ originalname: nomFichier } as Express.Multer.File, {
      type: TypeDocument.AUTRE,
      projet_id: 'projet-1',
    });
  }

  it('conserve plusieurs documents de même type quand leurs noms diffèrent', async () => {
    await ajouter('annexe-a.pdf');
    await ajouter('annexe-b.pdf');

    expect(documents).toHaveLength(2);
    expect(documents.every((document) => !document.est_archive)).toBe(true);
    expect(documentRepo.update).not.toHaveBeenCalled();
  });

  it('versionne et archive un document actif de même type et de même nom', async () => {
    await ajouter('annexe-a.pdf');
    const remplacement = await ajouter('annexe-a.pdf');

    expect(documents).toHaveLength(2);
    expect(documents[0].est_archive).toBe(true);
    expect(documents[1].est_archive).toBe(false);
    expect(remplacement.version).toBe(2);
    expect(documentRepo.update).toHaveBeenCalledWith('document-1', {
      est_archive: true,
    });
  });
});
