import { Logger } from '@nestjs/common';

interface VariableRequise {
  nom: string;
  minLength?: number;
  description: string;
}

const VARIABLES_REQUISES: VariableRequise[] = [
  {
    nom: 'DATABASE_URL',
    description: 'URL de connexion PostgreSQL',
  },
  {
    nom: 'JWT_SECRET',
    minLength: 32,
    description:
      'Secret de signature des access tokens (minimum 32 caracteres)',
  },
  {
    nom: 'JWT_REFRESH_SECRET',
    minLength: 32,
    description:
      'Secret de signature des refresh tokens (minimum 32 caracteres)',
  },
];

const VARIABLES_OPTIONNELLES = ['PORT', 'CORS_ORIGINS', 'NODE_ENV'];

// Parametres exiges uniquement lorsque l envoi reel est active (MAIL_MODE=smtp).
// Sans ce controle, une configuration SMTP incomplete laissait le serveur demarrer
// puis chaque echec d envoi etait avale (regle anti-enumeration) : aucun e-mail
// n arrivait et aucun message d erreur n apparaissait cote utilisateur.
const VARIABLES_SMTP_REQUISES: VariableRequise[] = [
  { nom: 'SMTP_HOST', description: 'Hote du serveur SMTP' },
  {
    nom: 'SMTP_PORT',
    description: 'Port du serveur SMTP (587 pour STARTTLS, 465 pour TLS)',
  },
  { nom: 'SMTP_USER', description: 'Identifiant de connexion SMTP' },
  { nom: 'SMTP_PASS', description: 'Mot de passe SMTP' },
  {
    nom: 'SMTP_FROM',
    description: 'Expediteur des e-mails (ex. Plateforme <noreply@domaine.mg>)',
  },
];

function validerConfigurationSmtp(erreurs: string[]): void {
  const mode = process.env.MAIL_MODE?.trim() ?? 'noop';

  if (mode !== 'noop' && mode !== 'smtp') {
    erreurs.push(
      `  - MAIL_MODE doit valoir "noop" ou "smtp" (valeur recue : "${process.env.MAIL_MODE}")`,
    );
    return;
  }

  if (mode !== 'smtp') {
    return;
  }

  for (const variable of VARIABLES_SMTP_REQUISES) {
    const valeur = process.env[variable.nom];

    if (!valeur || valeur.trim() === '') {
      erreurs.push(
        `  - ${variable.nom} manquant alors que MAIL_MODE=smtp (${variable.description})`,
      );
    }
  }

  const port = process.env.SMTP_PORT?.trim();

  if (port && !/^\d+$/.test(port)) {
    erreurs.push(
      `  - SMTP_PORT doit etre un nombre entier (valeur recue : "${port}")`,
    );
  }
}

export function validerEnvironnement(): void {
  const logger = new Logger('EnvValidation');
  const erreurs: string[] = [];

  for (const variable of VARIABLES_REQUISES) {
    const valeur = process.env[variable.nom];

    if (!valeur || valeur.trim() === '') {
      erreurs.push(`  - ${variable.nom} manquant (${variable.description})`);
      continue;
    }

    if (variable.minLength && valeur.length < variable.minLength) {
      erreurs.push(
        `  - ${variable.nom} trop court (${valeur.length} caracteres, minimum ${variable.minLength})`,
      );
    }

    // Verification de securite : secrets par defaut souvent copies du .env.example
    if (
      (variable.nom === 'JWT_SECRET' ||
        variable.nom === 'JWT_REFRESH_SECRET') &&
      /^(change_me|your_secret|secret|test)/i.test(valeur)
    ) {
      erreurs.push(
        `  - ${variable.nom} contient une valeur par defaut dangereuse (changez-la en production)`,
      );
    }
  }

  validerConfigurationSmtp(erreurs);

  if (erreurs.length > 0) {
    logger.error('Configuration invalide : le serveur refuse de demarrer.');
    for (const erreur of erreurs) {
      logger.error(erreur);
    }
    logger.error(
      'Verifiez votre fichier .env (ou les variables d environnement injectees).',
    );
    process.exit(1);
  }

  logger.log('Variables d environnement validees.');
  logger.log(
    `Variables optionnelles definies : ${VARIABLES_OPTIONNELLES.filter((v) => process.env[v]).join(', ') || 'aucune'}`,
  );
}
