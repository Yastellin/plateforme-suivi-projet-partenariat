export function formaterDateExport(date?: Date | string | null): string {
  if (!date) return '';
  const valeur = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(valeur.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeZone: 'UTC',
  }).format(valeur);
}

export function formaterDateHeureExport(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date);
}

export function valeurTexteExport(valeur: unknown): string {
  if (valeur === null || valeur === undefined) return '';
  if (typeof valeur === 'boolean') return valeur ? 'Oui' : 'Non';
  if (typeof valeur === 'string') return valeur.trim();
  if (typeof valeur === 'number' || typeof valeur === 'bigint') {
    return String(valeur);
  }
  if (valeur instanceof Date) return formaterDateExport(valeur);
  return JSON.stringify(valeur) ?? '';
}
