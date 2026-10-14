import { useAuth } from "./useAuth";

interface Permissions {
  canCreateProject: boolean;
  canEditProject: boolean;
  canViewDetail: boolean;
  canManagePartenaires: boolean;
  canManageConventions: boolean;
  canManageCotutelles: boolean;
  canManageDocuments: boolean;
  canManageEtablissements: boolean;
  canManagePublications: boolean;
  canAccessTableauDeBord: boolean;
  estPresidence: boolean;
  estEtablissement: boolean;
}

const AUCUNE_PERMISSION: Omit<Permissions, "estPresidence" | "estEtablissement"> = {
  canCreateProject: false,
  canEditProject: false,
  canViewDetail: false,
  canManagePartenaires: false,
  canManageConventions: false,
  canManageCotutelles: false,
  canManageDocuments: false,
  canManageEtablissements: false,
  canManagePublications: false,
  canAccessTableauDeBord: false,
};

function permissionsParRole(role: string | null) {
  switch (role) {
    case "PRESIDENCE":
      return {
        canCreateProject: true,
        canEditProject: true,
        canViewDetail: true,
        canManagePartenaires: true,
        canManageConventions: true,
        canManageCotutelles: true,
        canManageDocuments: true,
        canManageEtablissements: true,
        canManagePublications: true,
        canAccessTableauDeBord: true,
      };
    case "ETABLISSEMENT":
      return {
        canCreateProject: true,
        canEditProject: false,
        canViewDetail: true,
        canManagePartenaires: true,
        canManageConventions: true,
        canManageCotutelles: true,
        canManageDocuments: true,
        canManageEtablissements: true,
        canManagePublications: false,
        canAccessTableauDeBord: true,
      };
    case "DECIDEUR":
      return {
        canCreateProject: false,
        canEditProject: false,
        canViewDetail: true,
        canManagePartenaires: false,
        canManageConventions: true,
        canManageCotutelles: true,
        canManageDocuments: true,
        canManageEtablissements: false,
        canManagePublications: true,
        canAccessTableauDeBord: true,
      };
    default:
      return AUCUNE_PERMISSION;
  }
}

export function usePermissions(): Permissions {
  const { utilisateur } = useAuth();
  const role = utilisateur?.role ?? null;

  return {
    ...permissionsParRole(role),
    estPresidence: role === "PRESIDENCE",
    estEtablissement: role === "ETABLISSEMENT",
  };
}
