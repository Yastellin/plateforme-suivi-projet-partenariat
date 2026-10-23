export function nommerEtablissementSoumission(
  nom: string | null | undefined,
): string {
  const nomNormalise = nom?.trim();
  return nomNormalise
    ? `l’établissement « ${nomNormalise} »`
    : 'l’établissement concerné';
}
