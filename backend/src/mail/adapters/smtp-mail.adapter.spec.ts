import type { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import { SmtpMailAdapter } from './smtp-mail.adapter';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: jest.fn() })),
}));

const createTransportMoque = createTransport as unknown as jest.Mock;

// ConfigService renvoie toutes les variables sous forme de chaines : les tests
// reproduisent volontairement ce comportement (SMTP_PORT = "465" et non 465).
function configFictive(valeurs: Record<string, string>): ConfigService {
  return {
    get: (cle: string) => valeurs[cle],
    getOrThrow: (cle: string) => {
      const valeur = valeurs[cle];
      if (valeur === undefined) {
        throw new Error(`Configuration manquante : ${cle}`);
      }
      return valeur;
    },
  } as unknown as ConfigService;
}

const CONFIG_BASE: Record<string, string> = {
  SMTP_HOST: 'smtp.exemple.mg',
  SMTP_USER: 'utilisateur',
  SMTP_PASS: 'motdepasse',
  SMTP_FROM: 'Plateforme <noreply@exemple.mg>',
};

describe('SmtpMailAdapter', () => {
  beforeEach(() => {
    createTransportMoque.mockClear();
  });

  it('active le TLS implicite quand SMTP_PORT vaut "465"', () => {
    new SmtpMailAdapter(configFictive({ ...CONFIG_BASE, SMTP_PORT: '465' }));

    const options = createTransportMoque.mock.calls[0][0];
    expect(options.port).toBe(465);
    expect(options.secure).toBe(true);
  });

  it('laisse secure a false sur le port 587 (STARTTLS)', () => {
    new SmtpMailAdapter(configFictive({ ...CONFIG_BASE, SMTP_PORT: '587' }));

    const options = createTransportMoque.mock.calls[0][0];
    expect(options.port).toBe(587);
    expect(options.secure).toBe(false);
  });

  it('refuse un port non numerique avec un message explicite', () => {
    expect(
      () =>
        new SmtpMailAdapter(
          configFictive({ ...CONFIG_BASE, SMTP_PORT: 'smtp' }),
        ),
    ).toThrow(/SMTP_PORT invalide/);
  });

  it('transmet expediteur, destinataire, sujet et contenus a nodemailer', async () => {
    const adaptateur = new SmtpMailAdapter(
      configFictive({ ...CONFIG_BASE, SMTP_PORT: '587' }),
    );

    await adaptateur.envoyer({
      destinataire: 'destinataire@exemple.mg',
      sujet: 'Reinitialisation de votre mot de passe',
      contenu_texte: 'texte brut',
      contenu_html: '<p>texte html</p>',
    });

    const transport = createTransportMoque.mock.results[0].value as {
      sendMail: jest.Mock;
    };
    expect(transport.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG_BASE.SMTP_FROM,
        to: 'destinataire@exemple.mg',
        subject: 'Reinitialisation de votre mot de passe',
        text: 'texte brut',
        html: '<p>texte html</p>',
      }),
    );
  });
});
