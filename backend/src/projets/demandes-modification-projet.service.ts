import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Projet } from './entities/projet.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { HistoriqueService } from '../historique/historique.service';
import type { ContexteUtilisateur } from '../historique/historique.service';
import { ActionHistorique } from '../common/enums/action-historique.enum';
import { PrioriteNotification } from '../common/enums/priorite-notification.enum';
import { Role } from '../common/enums/role.enum';
import { StatutProjet } from '../common/enums/statut-projet.enum';
import { TypeNotification } from '../common/enums/type-notification.enum';
import {
  DecisionDemandeModificationProjet,
  REFERENCE_DEMANDE_MODIFICATION_PROJET,
  REFERENCE_DEMANDE_MODIFICATION_PROJET_APPROUVEE,
  REFERENCE_DEMANDE_MODIFICATION_PROJET_REJETEE,
} from './demandes-modification-projet.constants';

@Injectable()
export class DemandesModificationProjetService {
  constructor(
    @InjectRepository(Projet)
    private readonly projetRepo: Repository<Projet>,
    private readonly notifications: NotificationsService,
    private readonly historique: HistoriqueService,
  ) {}

  async demander(
    projetId: string,
    motif: string,
    etablissementId: string | null | undefined,
    utilisateur?: ContexteUtilisateur | null,
  ) {
    if (!etablissementId) {
      throw new ForbiddenException(
        'Le compte établissement doit être rattaché à un établissement.',
      );
    }

    const projet = await this.projetRepo.findOne({
      where: { id: projetId, archive: false },
      relations: { etablissement: true },
    });
    if (!projet) throw new NotFoundException('Projet non trouvé');

    if (
      projet.etablissement_id !== etablissementId ||
      projet.cree_par_role !== Role.ETABLISSEMENT
    ) {
      throw new ForbiddenException(
        'Un établissement ne peut demander la modification que de ses propres projets.',
      );
    }

    // Le modèle ne possède pas de statut PUBLIE : la publication est portée
    // par publie_le. Les projets soumis restent verrouillés aux statuts
    // EN_ATTENTE ou EN_COURS.
    const peutDemander =
      projet.statut === StatutProjet.EN_ATTENTE ||
      projet.statut === StatutProjet.EN_COURS ||
      Boolean(projet.publie_le);
    if (!peutDemander) {
      throw new ConflictException(
        'Une demande de modification est possible uniquement pour un projet soumis, en cours ou publié.',
      );
    }

    const demandeExistante = await this.notifications.existePourReference(
      REFERENCE_DEMANDE_MODIFICATION_PROJET,
      projet.id,
    );
    if (demandeExistante) {
      throw new ConflictException(
        'Une demande de modification est déjà en attente pour ce projet.',
      );
    }

    const destinataires =
      await this.notifications.trouverUtilisateursPresidence();
    if (destinataires.length === 0) {
      throw new ConflictException(
        'Aucun compte Présidence actif ne peut recevoir cette demande.',
      );
    }

    const etablissement =
      projet.etablissement?.nom ?? 'un établissement rattaché';
    await Promise.all(
      destinataires.map((utilisateurId) =>
        this.notifications.creer({
          titre: `Demande de modification : ${projet.nom}`,
          message: `${etablissement} demande la réouverture du projet « ${projet.nom} ». Motif : ${motif}`,
          type: TypeNotification.CHANGEMENT_STATUT,
          priorite: PrioriteNotification.HAUTE,
          utilisateur_id: utilisateurId,
          reference_type: REFERENCE_DEMANDE_MODIFICATION_PROJET,
          reference_id: projet.id,
          fenetreDedupJours: 0,
        }),
      ),
    );

    await this.historique.enregistrer({
      action: ActionHistorique.MODIFICATION,
      entite_type: 'Projet',
      entite_id: projet.id,
      entite_nom: projet.nom,
      utilisateur: utilisateur ?? null,
      details: `Demande de modification envoyée. Motif : ${motif}`,
    });

    return {
      projet_id: projet.id,
      statut: projet.statut,
      demande: 'EN_ATTENTE',
    };
  }

  async traiter(
    projetId: string,
    decision: DecisionDemandeModificationProjet,
    utilisateur?: ContexteUtilisateur | null,
  ) {
    const projet = await this.projetRepo.findOneBy({
      id: projetId,
      archive: false,
    });
    if (!projet) throw new NotFoundException('Projet non trouvé');
    if (projet.cree_par_role !== Role.ETABLISSEMENT) {
      throw new ForbiddenException(
        "Seule la demande concernant un projet d'établissement peut être traitée.",
      );
    }

    const demandeExiste = await this.notifications.existePourReference(
      REFERENCE_DEMANDE_MODIFICATION_PROJET,
      projet.id,
    );
    if (!demandeExiste) {
      throw new ConflictException(
        'Aucune demande de modification en attente pour ce projet.',
      );
    }

    const approuvee = decision === DecisionDemandeModificationProjet.APPROUVEE;
    if (approuvee) {
      // La réouverture démarre un nouveau cycle de soumission/publication. Les
      // décisions précédentes restent traçables dans Notifications et Historique.
      await this.projetRepo.update(projet.id, {
        statut: StatutProjet.BROUILLON,
        soumis_le: null,
        publie_le: null,
      });
    }

    const referenceFinale = approuvee
      ? REFERENCE_DEMANDE_MODIFICATION_PROJET_APPROUVEE
      : REFERENCE_DEMANDE_MODIFICATION_PROJET_REJETEE;
    await this.notifications.resoudreReference(
      REFERENCE_DEMANDE_MODIFICATION_PROJET,
      projet.id,
      {
        reference_type: referenceFinale,
        titre: `Demande ${approuvee ? 'approuvée' : 'rejetée'} : ${projet.nom}`,
      },
    );

    const destinataires =
      await this.notifications.trouverUtilisateursEtablissement(
        projet.etablissement_id,
      );
    const titre = `Demande de modification ${approuvee ? 'approuvée' : 'rejetée'} : ${projet.nom}`;
    const message = approuvee
      ? `Le projet « ${projet.nom} » est repassé en brouillon. Vous pouvez le modifier puis le soumettre à nouveau.`
      : `La Présidence a rejeté la demande de modification du projet « ${projet.nom} ». Le projet reste verrouillé.`;

    await Promise.all(
      destinataires.map((utilisateurId) =>
        this.notifications.creer({
          titre,
          message,
          type: TypeNotification.CHANGEMENT_STATUT,
          priorite: PrioriteNotification.MOYENNE,
          utilisateur_id: utilisateurId,
          reference_type: referenceFinale,
          reference_id: projet.id,
          fenetreDedupJours: 0,
        }),
      ),
    );

    await this.historique.enregistrer({
      action: ActionHistorique.MODIFICATION,
      entite_type: 'Projet',
      entite_id: projet.id,
      entite_nom: projet.nom,
      utilisateur: utilisateur ?? null,
      details: `Demande de modification ${approuvee ? 'approuvée' : 'rejetée'} par la Présidence.`,
    });

    return {
      projet_id: projet.id,
      decision,
      statut: approuvee ? StatutProjet.BROUILLON : projet.statut,
    };
  }
}
