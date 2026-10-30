/**
 * Jeu de donnees de demonstration.
 *
 * Remplace l'ancien seed Prisma (prisma/seed.ts) : memes donnees, memes
 * identifiants, mais via TypeORM.
 *
 * Usage : npm run seed
 * Prerequis : les migrations doivent avoir ete appliquees (npm run migration:run).
 */
import 'reflect-metadata';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import dataSource from './data-source';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Utilisateur } from '../auth/entities/utilisateur.entity';
import { Role } from '../common/enums/role.enum';
import { Porteur } from '../referentiels/porteurs/entities/porteur.entity';
import { Bailleur } from '../referentiels/bailleurs/entities/bailleur.entity';
import { Beneficiaire } from '../referentiels/beneficiaires/entities/beneficiaire.entity';
import { Site } from '../referentiels/sites/entities/site.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Contact } from '../partenaires/entities/contact.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { PartenariatEtablissement } from '../partenariats/entities/partenariat-etablissement.entity';
import { PartenariatPartenaire } from '../partenariats/entities/partenariat-partenaire.entity';
import { Projet } from '../projets/entities/projet.entity';
import { ProjetBailleur } from '../projets/entities/projet-bailleur.entity';
import { ProjetBeneficiaire } from '../projets/entities/projet-beneficiaire.entity';
import { ProjetSite } from '../projets/entities/projet-site.entity';
import { ProjetPartenaire } from '../projets/entities/projet-partenaire.entity';
import { Activite } from '../projets/entities/activite.entity';
import { Publication } from '../publications/enitities/publication.entity';
import { PhotoPublication } from '../publications/enitities/photo-publication.entity';
import { StatutPublication } from '../common/enums/statut-publication.enum';
import { Convention } from '../conventions/entities/convention.entity';
import { StatutPartenaire } from '../common/enums/statut-partenaire.enum';
import { Visibilite } from '../common/enums/visibilite.enum';
import { DomainePartenariat } from '../common/enums/domaine-partenariat.enum';
import { StatutPartenariat } from '../common/enums/statut-partenariat.enum';
import { StatutProjet } from '../common/enums/statut-projet.enum';
import { StatutConvention } from '../common/enums/statut-convention.enum';
import { TypeCoordonnee } from '../common/enums/type-coordonnee.enum';
import { Coordonnee } from '../coordonnees/entities/coordonnee.entity';

/** Toutes les tables de donnees (hors table de migrations). */
const TABLES = [
  'Notification',
  'PhotoPublication',
  'Publication',
  'Document',
  'Convention',
  'Chronogramme',
  'Activite',
  'ProjetBailleur',
  'ProjetSite',
  'ProjetBeneficiaire',
  'ProjetPartenaire',
  'Projet',
  'CotutelleThese',
  'PartenariatPartenaire',
  'PartenariatEtablissement',
  'Partenariat',
  'Coordonnee',
  'Contact',
  'Partenaire',
  'password_reset_tokens',
  'RefreshToken',
  'Utilisateur',
  'SyntheseItem',
  'SynthesePartenaireStrategique',
  'Etablissement',
  'Porteur',
  'Bailleur',
  'Beneficiaire',
  'Site',
];

/**
 * Cree puis enregistre une entite.
 *
 * Passe par repository.create() : l'objet retourne est une instance de la
 * classe d'entite, ce qui declenche les hooks @BeforeInsert (generation des
 * identifiants). Un simple objet litteral passe a save() ne les declenche pas.
 */
async function creer<T extends ObjectLiteral>(
  ds: DataSource,
  cible: EntityTarget<T>,
  valeurs: Partial<T>,
): Promise<T> {
  const depot: Repository<T> = ds.getRepository(cible);
  const entite = depot.create(valeurs as any);
  return (await depot.save(entite as any)) as T;
}

/** Vide toutes les tables de donnees (hors table de migrations). */
export async function viderTables(ds: DataSource): Promise<void> {
  const liste = TABLES.map((t) => `"${t}"`).join(', ');
  await ds.query(`TRUNCATE TABLE ${liste} CASCADE`);
}

/**
 * Cree le jeu de donnees de demonstration dans la base fournie.
 * Exporte pour etre reutilise par les tests d'integration.
 */
export async function executerSeed(ds: DataSource): Promise<void> {
  await viderTables(ds);
  console.log('Base nettoyée');

  // --- Établissements ---
  const etab1 = await creer(ds, Etablissement, {
    nom: 'Faculté des Sciences',
    sigle: 'FDS',
    description: "Faculté des Sciences de l'Université de Fianarantsoa",
  });

  const etab2 = await creer(ds, Etablissement, {
    nom: 'Faculté des Lettres et Sciences Humaines',
    sigle: 'FLSH',
    description: 'Faculté des Lettres et Sciences Humaines',
  });

  // --- Utilisateurs ---
  const passwordHash = await bcrypt.hash('password123', 10);
  const depotUtilisateurs = ds.getRepository(Utilisateur);

  await depotUtilisateurs.save([
    depotUtilisateurs.create({
      email: 'presidence@univ-fianarantsoa.mg',
      password_hash: passwordHash,
      role: Role.PRESIDENCE,
      actif: true,
    }),
    depotUtilisateurs.create({
      email: 'fds@univ-fianarantsoa.mg',
      password_hash: passwordHash,
      role: Role.ETABLISSEMENT,
      etablissement_id: etab1.id,
      actif: true,
    }),
    depotUtilisateurs.create({
      email: 'flsh@univ-fianarantsoa.mg',
      password_hash: passwordHash,
      role: Role.ETABLISSEMENT,
      etablissement_id: etab2.id,
      actif: true,
    }),
    depotUtilisateurs.create({
      email: 'president@univ-fianarantsoa.mg',
      password_hash: passwordHash,
      role: Role.DECIDEUR,
      actif: true,
    }),
  ]);

  console.log('Utilisateurs créés avec le mot de passe "password123"');
  console.log('  - presidence@univ-fianarantsoa.mg (PRESIDENCE)');
  console.log('  - fds@univ-fianarantsoa.mg (ETABLISSEMENT)');
  console.log('  - flsh@univ-fianarantsoa.mg (ETABLISSEMENT)');
  console.log('  - president@univ-fianarantsoa.mg (DECIDEUR)');

  // --- Référentiels ---
  const porteur = await creer(ds, Porteur, {
    nom: 'Dr. Rakoto Jean',
    institution_rattachement: 'FDS',
  });

  const bailleur = await creer(ds, Bailleur, {
    nom: 'UE',
    description: 'Union Européenne',
  });

  const beneficiaire = await creer(ds, Beneficiaire, {
    nom: 'Étudiants de Master',
    categorie: 'Étudiants',
  });

  const site = await creer(ds, Site, {
    nom: 'Campus Fianarantsoa',
    description: 'Site principal',
  });

  // --- Partenaire ---
  const partenaire = await creer(ds, Partenaire, {
    nom: 'Université de Toliara',
    type: 'Université',
    pays: 'Madagascar',
    adresse: 'Maninday, Toliara',
    telephone: '+261 34 12 345 67',
    email: 'contact@univ-fianarantsoa.mg',
    site_web: 'https://www.univ-fianarantsoa.mg',
    description: 'Partenaire académique historique',
    statut: StatutPartenaire.ACTIF,
    visibilite: Visibilite.PUBLIC,
    est_strategique: true,
    etablissement_id: etab1.id,
    cree_par_role: Role.PRESIDENCE,
    publie_le: new Date(),
  });

  const contact = await creer(ds, Contact, {
    nom: 'Pr. Rakoto Soa',
    fonction: 'Responsable des relations interuniversitaires',
    email: 'soa.rakoto@univ-fianarantsoa.mg',
    telephone: '+261 32 12 345 67',
    partenaire_id: partenaire.id,
  });

  // Le seed passe habituellement après les migrations : il alimente donc
  // aussi le registre normalisé qui garantit l'unicité globale des coordonnées.
  await creer(ds, Coordonnee, {
    type: TypeCoordonnee.EMAIL,
    valeur: partenaire.email!,
    valeur_normalisee: partenaire.email!.trim().toLocaleLowerCase('fr'),
    partenaire_id: partenaire.id,
  });
  await creer(ds, Coordonnee, {
    type: TypeCoordonnee.TELEPHONE,
    valeur: partenaire.telephone!,
    valeur_normalisee: '+261341234567',
    partenaire_id: partenaire.id,
  });
  await creer(ds, Coordonnee, {
    type: TypeCoordonnee.EMAIL,
    valeur: contact.email!,
    valeur_normalisee: contact.email!.trim().toLocaleLowerCase('fr'),
    contact_id: contact.id,
  });
  await creer(ds, Coordonnee, {
    type: TypeCoordonnee.TELEPHONE,
    valeur: contact.telephone!,
    valeur_normalisee: '+261321234567',
    contact_id: contact.id,
  });

  // --- Partenariat ---
  const partenariat = await creer(ds, Partenariat, {
    intitule: 'Coopération scientifique interuniversitaire à Madagascar',
    objet: 'Échanges de chercheurs et co-publications',
    domaine: DomainePartenariat.RECHERCHE,
    date_debut: new Date('2024-01-01'),
    date_fin: new Date('2026-12-31'),
    statut: StatutPartenariat.EN_COURS,
    actions_realisees: "Missions d'échange réalisées en 2024",
    actions_en_cours: "Préparation d'un projet de recherche commun",
    cree_par_role: Role.PRESIDENCE,
    publie_le: new Date(),
  });

  await creer(ds, PartenariatEtablissement, {
    partenariat_id: partenariat.id,
    etablissement_id: etab1.id,
  });

  await creer(ds, PartenariatPartenaire, {
    partenariat_id: partenariat.id,
    partenaire_id: partenaire.id,
  });

  // --- Projet ---
  const projet = await creer(ds, Projet, {
    nom: 'Projet Biodiversité',
    intitule_officiel:
      'Étude de la biodiversité dans les Hautes Terres malgaches',
    type: 'Recherche',
    domaine: 'Biologie',
    budget: 45000.5,
    date_debut: new Date('2025-01-15'),
    date_fin_prevue: new Date('2026-06-30'),
    statut: StatutProjet.BROUILLON,
    etablissement_id: etab1.id,
    porteur_id: porteur.id,
    partenariat_id: partenariat.id,
    cree_par_role: Role.PRESIDENCE,
  });

  await creer(ds, ProjetBailleur, {
    projet_id: projet.id,
    bailleur_id: bailleur.id,
  });

  await creer(ds, ProjetBeneficiaire, {
    projet_id: projet.id,
    beneficiaire_id: beneficiaire.id,
  });

  await creer(ds, ProjetSite, {
    projet_id: projet.id,
    site_id: site.id,
  });

  await creer(ds, ProjetPartenaire, {
    projet_id: projet.id,
    partenaire_id: partenaire.id,
  });

  // Projet publié de démonstration pour alimenter la vitrine sans action manuelle.
  const projetPublieDemo = await creer(ds, Projet, {
    nom: 'Programme de recherche en partenariat',
    intitule_officiel: 'Échanges scientifiques entre universités malgaches',
    type: 'Recherche',
    domaine: 'Coopération scientifique',
    budget: null,
    date_debut: new Date('2025-02-01'),
    date_fin_prevue: new Date('2027-02-01'),
    statut: StatutProjet.EN_COURS,
    etablissement_id: etab1.id,
    porteur_id: porteur.id,
    partenariat_id: partenariat.id,
    cree_par_role: Role.PRESIDENCE,
    publie_le: new Date(),
  });

  await creer(ds, ProjetPartenaire, {
    projet_id: projetPublieDemo.id,
    partenaire_id: partenaire.id,
  });

  // Publication de démonstration avec une couverture distincte de sa galerie.
  await creer(ds, Publication, {
    titre: 'Découvrir la biodiversité des Hautes Terres',
    description_publique:
      'Présentation des travaux de terrain menés dans le cadre du projet.',
    date_publication: null,
    statut: StatutPublication.BROUILLON,
    resultats: null,
    image_couverture_url:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
    projet_id: projet.id,
  });

  const publicationPublieeDemo = await creer(ds, Publication, {
    titre: 'Échanges scientifiques entre universités malgaches',
    description_publique:
      'Retour sur les activités de coopération et les échanges menés à Fianarantsoa.',
    date_publication: new Date(),
    statut: StatutPublication.PUBLIEE,
    resultats: 'Les équipes ont défini des pistes de recherche communes.',
    image_couverture_url:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
    projet_id: projetPublieDemo.id,
  });

  await creer(ds, PhotoPublication, {
    url_fichier:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
    legende: 'Paysage illustrant les échanges de terrain.',
    ordre: 0,
    publication_id: publicationPublieeDemo.id,
  });

  await creer(ds, Activite, {
    intitule: 'Phase de terrain',
    ordre: 1,
    terminee: false,
    date_echeance: new Date('2025-04-30'),
    projet_id: projet.id,
  });

  await creer(ds, Convention, {
    reference: 'CONV-2025-001',
    titre: 'Convention de partenariat FDS - Université de Toliara',
    date_debut: new Date('2025-01-01'),
    date_fin: new Date('2027-01-01'),
    statut: StatutConvention.EN_ATTENTE_SIGNATURE,
    description: 'Convention cadre pour les échanges académiques',
    partenariat_id: partenariat.id,
  });

  console.log('Données de démonstration créées avec succès.');
}

async function main(): Promise<void> {
  config();
  console.log('Démarrage du seed...');
  await dataSource.initialize();

  try {
    await executerSeed(dataSource);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Execution directe : npm run seed
if (require.main === module) {
  main().catch((e) => {
    console.error('Erreur lors du seed:', e);
    process.exitCode = 1;
  });
}
