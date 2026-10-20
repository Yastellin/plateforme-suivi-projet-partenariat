/**
 * Liste exhaustive des entites TypeORM de l'application.
 *
 * Import explicite volontaire : les motifs globaux (*.entity.ts) ne trouvent
 * aucune entite une fois le projet compile en JavaScript (dist/*.entity.js).
 */
import { Activite } from '../projets/entities/activite.entity';
import { Bailleur } from '../referentiels/bailleurs/entities/bailleur.entity';
import { Beneficiaire } from '../referentiels/beneficiaires/entities/beneficiaire.entity';
import { Chronogramme } from '../activites/chronogramme/entities/chronogramme.entity';
import { Contact } from '../partenaires/entities/contact.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { Document } from '../documents/entities/document.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { MessageContact } from '../messages-contact/entities/message-contact.entity';
import { Configuration } from '../configuration/entities/configuration.entity';
import { HistoriqueAction } from '../historique/entities/historique-action.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { PartenariatEtablissement } from '../partenariats/entities/partenariat-etablissement.entity';
import { PartenariatPartenaire } from '../partenariats/entities/partenariat-partenaire.entity';
import { PasswordResetToken } from '../auth/entities/password-reset-token.entity';
import { PhotoPublication } from '../publications/enitities/photo-publication.entity';
import { Porteur } from '../referentiels/porteurs/entities/porteur.entity';
import { Projet } from '../projets/entities/projet.entity';
import { ProjetBailleur } from '../projets/entities/projet-bailleur.entity';
import { ProjetBeneficiaire } from '../projets/entities/projet-beneficiaire.entity';
import { ProjetPartenaire } from '../projets/entities/projet-partenaire.entity';
import { ProjetSite } from '../projets/entities/projet-site.entity';
import { Publication } from '../publications/enitities/publication.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { Site } from '../referentiels/sites/entities/site.entity';
import { SyntheseItem } from '../synthese/entities/synthese-item.entity';
import { SynthesePartenaireStrategique } from '../synthese/entities/synthese-partenaire-strategique.entity';
import { Utilisateur } from '../auth/entities/utilisateur.entity';

export const ENTITES = [
  Activite,
  Configuration,
  HistoriqueAction,
  Bailleur,
  Beneficiaire,
  Chronogramme,
  Contact,
  Convention,
  CotutelleThese,
  Document,
  Etablissement,
  MessageContact,
  Notification,
  Partenaire,
  Partenariat,
  PartenariatEtablissement,
  PartenariatPartenaire,
  PasswordResetToken,
  PhotoPublication,
  Porteur,
  Projet,
  ProjetBailleur,
  ProjetBeneficiaire,
  ProjetPartenaire,
  ProjetSite,
  Publication,
  RefreshToken,
  Site,
  SyntheseItem,
  SynthesePartenaireStrategique,
  Utilisateur,
];
