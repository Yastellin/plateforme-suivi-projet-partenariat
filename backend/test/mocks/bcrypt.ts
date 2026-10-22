/*
 * Remplacement déterministe du module natif bcrypt pour les tests HTTP.
 * La production continue d'utiliser bcrypt ; ce faux évite de rendre la suite
 * dépendante d'un binaire natif téléchargé pendant l'installation.
 */
export async function hash(valeur: string): Promise<string> {
  return `$bcrypt-test$${Buffer.from(valeur, 'utf8').toString('base64url')}`;
}

export async function compare(valeur: string, empreinte: string): Promise<boolean> {
  return empreinte === (await hash(valeur));
}
