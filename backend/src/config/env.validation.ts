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
    description: 'Secret de signature des access tokens (minimum 32 caracteres)',
  },
  {
    nom: 'JWT_REFRESH_SECRET',
    minLength: 32,
    description: 'Secret de signature des refresh tokens (minimum 32 caracteres)',
  },
];

const VARIABLES_OPTIONNELLES = ['PORT', 'CORS_ORIGINS', 'NODE_ENV'];

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
      (variable.nom === 'JWT_SECRET' || variable.nom === 'JWT_REFRESH_SECRET') &&
      /^(change_me|your_secret|secret|test)/i.test(valeur)
    ) {
      erreurs.push(
        `  - ${variable.nom} contient une valeur par defaut dangereuse (changez-la en production)`,
      );
    }
  }

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