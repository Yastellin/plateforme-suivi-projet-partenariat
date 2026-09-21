import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Démarrage du seed...');

  // Nettoyage
  await prisma.notification.deleteMany();
  await prisma.photoPublication.deleteMany();
  await prisma.publication.deleteMany();
  await prisma.document.deleteMany();
  await prisma.convention.deleteMany();
  await prisma.chronogramme.deleteMany();
  await prisma.activite.deleteMany();
  await prisma.projetBailleur.deleteMany();
  await prisma.projetSite.deleteMany();
  await prisma.projetBeneficiaire.deleteMany();
  await prisma.projetPartenaire.deleteMany();
  await prisma.projet.deleteMany();
  await prisma.cotutelleThese.deleteMany();
  await prisma.partenariatPartenaire.deleteMany();
  await prisma.partenariatEtablissement.deleteMany();
  await prisma.partenariat.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.partenaire.deleteMany();
  await prisma.utilisateur.deleteMany();
  await prisma.etablissement.deleteMany();
  await prisma.porteur.deleteMany();
  await prisma.bailleur.deleteMany();
  await prisma.beneficiaire.deleteMany();
  await prisma.site.deleteMany();

  console.log('Base nettoyée');

  // Établissements
  const etab1 = await prisma.etablissement.create({
    data: {
      nom: 'Faculté des Sciences',
      sigle: 'FDS',
      description: 'Faculté des Sciences de l\'Université de Fianarantsoa',
    },
  });

  const etab2 = await prisma.etablissement.create({
    data: {
      nom: 'Faculté des Lettres et Sciences Humaines',
      sigle: 'FLSH',
      description: 'Faculté des Lettres et Sciences Humaines',
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  // Utilisateurs
  await prisma.utilisateur.create({
    data: {
      email: 'presidence@univ-fianarantsoa.mg',
      password_hash: passwordHash,
      role: Role.PRESIDENCE,
      actif: true,
    },
  });

  await prisma.utilisateur.create({
    data: {
      email: 'fds@univ-fianarantsoa.mg',
      password_hash: passwordHash,
      role: Role.ETABLISSEMENT,
      etablissement_id: etab1.id,
      actif: true,
    },
  });

  await prisma.utilisateur.create({
    data: {
      email: 'flsh@univ-fianarantsoa.mg',
      password_hash: passwordHash,
      role: Role.ETABLISSEMENT,
      etablissement_id: etab2.id,
      actif: true,
    },
  });

  await prisma.utilisateur.create({
    data: {
      email: 'president@univ-fianarantsoa.mg',
      password_hash: passwordHash,
      role: Role.DECIDEUR,
      actif: true,
    },
  });

  console.log('Utilisateurs créés avec le mot de passe "password123"');
  console.log('  - presidence@univ-fianarantsoa.mg (PRESIDENCE)');
  console.log('  - fds@univ-fianarantsoa.mg (ETABLISSEMENT)');
  console.log('  - flsh@univ-fianarantsoa.mg (ETABLISSEMENT)');
  console.log('  - president@univ-fianarantsoa.mg (DECIDEUR)');

  // Référentiels
  const porteur = await prisma.porteur.create({
    data: { nom: 'Dr. Rakoto Jean', institution_rattachement: 'FDS' },
  });

  const bailleur = await prisma.bailleur.create({
    data: { nom: 'UE', description: 'Union Européenne' },
  });

  const beneficiaire = await prisma.beneficiaire.create({
    data: { nom: 'Étudiants de Master', categorie: 'Étudiants' },
  });

  const site = await prisma.site.create({
    data: { nom: 'Campus Fianarantsoa', description: 'Site principal' },
  });

  // Partenaire
  const partenaire = await prisma.partenaire.create({
    data: {
      nom: 'Université de Toulouse',
      type: 'Université',
      pays: 'France',
      adresse: 'Toulouse, France',
      telephone: '+33 5 61 55 66 77',
      email: 'contact@univ-toulouse.fr',
      site_web: 'https://www.univ-toulouse.fr',
      description: 'Partenaire académique historique',
      statut: 'ACTIF',
      visibilite: 'PUBLIC',
      est_strategique: true,
      etablissement_id: etab1.id,
    },
  });

  await prisma.contact.create({
    data: {
      nom: 'Prof. Dupont Marie',
      fonction: 'Responsable des relations internationales',
      email: 'marie.dupont@univ-toulouse.fr',
      telephone: '+33 5 61 55 88 99',
      partenaire_id: partenaire.id,
    },
  });

  // Partenariat
  const partenariat = await prisma.partenariat.create({
    data: {
      intitule: 'Coopération scientifique Madagascar - France',
      objet: 'Échanges de chercheurs et co-publications',
      domaine: 'RECHERCHE',
      date_debut: new Date('2024-01-01'),
      date_fin: new Date('2026-12-31'),
      statut: 'EN_COURS',
      actions_realisees: 'Missions d\'échange réalisées en 2024',
      actions_en_cours: 'Préparation d\'un projet de recherche commun',
      etablissements: { create: { etablissement_id: etab1.id } },
      partenaires: { create: { partenaire_id: partenaire.id } },
    },
  });

  // Projet
  const projet = await prisma.projet.create({
    data: {
      nom: 'Projet Biodiversité',
      intitule_officiel: 'Étude de la biodiversité dans les Hautes Terres malgaches',
      type: 'Recherche',
      domaine: 'Biologie',
      budget: 45000.5,
      date_debut: new Date('2025-01-15'),
      date_fin_prevue: new Date('2026-06-30'),
      statut: 'BROUILLON',
      etablissement_id: etab1.id,
      porteur_id: porteur.id,
      partenariat_id: partenariat.id,
      bailleurs: { create: { bailleur_id: bailleur.id } },
      beneficiaires: { create: { beneficiaire_id: beneficiaire.id } },
      sites: { create: { site_id: site.id } },
    },
  });

  await prisma.activite.create({
    data: {
      intitule: 'Phase de terrain',
      ordre: 1,
      terminee: false,
      date_echeance: new Date('2025-04-30'),
      projet_id: projet.id,
    },
  });

  await prisma.convention.create({
    data: {
      reference: 'CONV-2025-001',
      titre: 'Convention de partenariat FDS - Université de Toulouse',
      date_debut: new Date('2025-01-01'),
      date_fin: new Date('2027-01-01'),
      statut: 'EN_ATTENTE_SIGNATURE',
      description: 'Convention cadre pour les échanges académiques',
      partenariat_id: partenariat.id,
    },
  });

  console.log('Données de démonstration créées avec succès.');
}

main()
  .catch(e => {
    console.error('Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });