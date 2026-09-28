// src/lib/payload.ts

export function videsEnNull<T extends object>(objet: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(objet).map(([cle, valeur]) => [cle, valeur === '' ? null : valeur]),
  );
}