// src/lib/format.ts

export function formaterDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function versIso(dateSaisie: string): string {
  return new Date(`${dateSaisie}T00:00:00.000Z`).toISOString();
}

export function versChampDate(dateIso: string): string {
  return dateIso.slice(0, 10);
}