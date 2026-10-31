export enum PorteeExport {
  TOUT = 'TOUT',
  CONVENTIONS = 'CONVENTIONS',
  PROJETS = 'PROJETS',
  PARTENARIATS = 'PARTENARIATS',
  PARTENAIRES = 'PARTENAIRES',
}

export enum ModePeriodeExport {
  TOUT = 'TOUT',
  ANNEE = 'ANNEE',
  MOIS = 'MOIS',
  INTERVALLE = 'INTERVALLE',
}

export enum ChampDateExport {
  SIGNATURE = 'SIGNATURE',
  DEBUT = 'DEBUT',
  FIN = 'FIN',
}

export enum StatutFiltreExport {
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  EN_RETARD = 'EN_RETARD',
  SUSPENDU = 'SUSPENDU',
  EXPIRE = 'EXPIRE',
}

export enum FormatExportAvance {
  XLSX = 'XLSX',
  CSV = 'CSV',
  PDF = 'PDF',
}

export const STATUTS_FILTRE_EXPORT = Object.values(StatutFiltreExport);

export const LIBELLES_PORTÉE_EXPORT: Record<PorteeExport, string> = {
  [PorteeExport.TOUT]: 'Toutes les données',
  [PorteeExport.CONVENTIONS]: 'Conventions',
  [PorteeExport.PROJETS]: 'Projets',
  [PorteeExport.PARTENARIATS]: 'Partenariats',
  [PorteeExport.PARTENAIRES]: 'Partenaires',
};
