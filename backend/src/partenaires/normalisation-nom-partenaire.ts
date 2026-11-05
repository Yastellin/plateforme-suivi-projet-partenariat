export function normaliserNomPartenaire(valeur: string): string {
  return valeur
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('fr');
}

export function calculerSimilariteNoms(a: string, b: string): number {
  const gauche = normaliserNomPartenaire(a);
  const droite = normaliserNomPartenaire(b);
  if (!gauche || !droite) return 0;
  if (gauche === droite) return 1;

  const lignePrecedente = Array.from(
    { length: droite.length + 1 },
    (_, index) => index,
  );
  for (let i = 1; i <= gauche.length; i += 1) {
    const ligneCourante = [i];
    for (let j = 1; j <= droite.length; j += 1) {
      const cout = gauche[i - 1] === droite[j - 1] ? 0 : 1;
      ligneCourante[j] = Math.min(
        ligneCourante[j - 1] + 1,
        lignePrecedente[j] + 1,
        lignePrecedente[j - 1] + cout,
      );
    }
    lignePrecedente.splice(0, lignePrecedente.length, ...ligneCourante);
  }

  return (
    1 - lignePrecedente[droite.length] / Math.max(gauche.length, droite.length)
  );
}
