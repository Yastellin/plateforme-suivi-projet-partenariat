export function nomAffichageUtilisateur(email: string): string {
  const partBeforeAt = email.split("@")[0];
  const parts = partBeforeAt.split(".");
  if (parts.length >= 2) {
    const prenom = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const nom = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    return `${nom} ${prenom.charAt(0).toUpperCase()}.`;
  }
  return partBeforeAt.charAt(0).toUpperCase() + partBeforeAt.slice(1);
}

export function initialesUtilisateur(email: string): string {
  const partBeforeAt = email.split("@")[0];
  const initials = partBeforeAt
    .split(".")
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
  return initials;
}