import { Logger } from '@nestjs/common';
import { validerEnvironnement } from './env.validation';

const ENVIRONNEMENT_INITIAL = { ...process.env };

const SMTP_COMPLET = {
  SMTP_HOST: 'smtp.exemple.mg',
  SMTP_PORT: '587',
  SMTP_USER: 'utilisateur',
  SMTP_PASS: 'motdepasse',
  SMTP_FROM: 'Plateforme <noreply@exemple.mg>',
};

describe('validerEnvironnement', () => {
  let sortie: jest.SpyInstance;

  beforeEach(() => {
    process.env = { ...ENVIRONNEMENT_INITIAL };
    // Variables minimales valides, hors sujet du test.
    process.env.DATABASE_URL =
      'postgresql://postgres:secret@localhost:5432/base';
    process.env.JWT_SECRET = 'un_secret_de_test_suffisamment_long_32';
    process.env.JWT_REFRESH_SECRET = 'un_autre_secret_de_test_assez_long';
    delete process.env.MAIL_MODE;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_FROM;

    // On rend le refus de demarrage observable au lieu de tuer le processus de test.
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    sortie = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = ENVIRONNEMENT_INITIAL;
  });

  it('accepte une configuration sans SMTP quand MAIL_MODE est absent (noop par defaut)', () => {
    expect(() => validerEnvironnement()).not.toThrow();
    expect(sortie).not.toHaveBeenCalled();
  });

  it('accepte une configuration sans SMTP quand MAIL_MODE=noop', () => {
    process.env.MAIL_MODE = 'noop';

    expect(() => validerEnvironnement()).not.toThrow();
    expect(sortie).not.toHaveBeenCalled();
  });

  it('refuse le demarrage en MAIL_MODE=smtp quand les parametres SMTP manquent', () => {
    process.env.MAIL_MODE = 'smtp';

    expect(() => validerEnvironnement()).toThrow('process.exit');
    expect(sortie).toHaveBeenCalledWith(1);
  });

  it('accepte le demarrage en MAIL_MODE=smtp quand tous les parametres sont fournis', () => {
    process.env.MAIL_MODE = 'smtp';
    Object.assign(process.env, SMTP_COMPLET);

    expect(() => validerEnvironnement()).not.toThrow();
    expect(sortie).not.toHaveBeenCalled();
  });

  it('refuse un SMTP_PORT non numerique', () => {
    process.env.MAIL_MODE = 'smtp';
    Object.assign(process.env, SMTP_COMPLET, { SMTP_PORT: 'smtp' });

    expect(() => validerEnvironnement()).toThrow('process.exit');
    expect(sortie).toHaveBeenCalledWith(1);
  });

  it('refuse une valeur de MAIL_MODE inconnue plutot que de la traiter en silence', () => {
    process.env.MAIL_MODE = 'SMTP';

    expect(() => validerEnvironnement()).toThrow('process.exit');
    expect(sortie).toHaveBeenCalledWith(1);
  });
});
