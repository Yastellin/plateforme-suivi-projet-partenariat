-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PRESIDENCE', 'ETABLISSEMENT', 'DECIDEUR');

-- CreateEnum
CREATE TYPE "Visibilite" AS ENUM ('PUBLIC', 'PRIVE');

-- CreateEnum
CREATE TYPE "StatutPartenaire" AS ENUM ('ACTIF', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "DomainePartenariat" AS ENUM ('RECHERCHE', 'FORMATION', 'INNOVATION', 'DEVELOPPEMENT', 'COOPERATION_INSTITUTIONNELLE', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutPartenariat" AS ENUM ('BROUILLON', 'EN_ATTENTE', 'EN_COURS', 'SUSPENDU', 'TERMINE');

-- CreateEnum
CREATE TYPE "StatutProjet" AS ENUM ('BROUILLON', 'EN_ATTENTE', 'EN_COURS', 'SUSPENDU', 'EXPIRE', 'TERMINE');

-- CreateEnum
CREATE TYPE "TypeCotutelle" AS ENUM ('COTUTELLE', 'COENCADREMENT');

-- CreateEnum
CREATE TYPE "StatutConvention" AS ENUM ('BROUILLON', 'EN_ATTENTE_SIGNATURE', 'SIGNEE', 'ACTIVE', 'SUSPENDUE', 'EXPIREE');

-- CreateEnum
CREATE TYPE "EtapeCircuit" AS ENUM ('REDACTION', 'TRANSMISSION', 'VERIFICATION_DAJ', 'ATTENTE_SIGNATURE', 'SIGNEE');

-- CreateEnum
CREATE TYPE "TypeDocument" AS ENUM ('TDR', 'DESCRIPTION', 'CONVENTION', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutPublication" AS ENUM ('BROUILLON', 'PUBLIEE');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('PROJET_SOUMIS', 'PARTENARIAT_SOUMIS', 'EXPIRATION_CONVENTION', 'CONVENTION_EXPIREE', 'ACTIVITE_ECHEANCE', 'ACTIVITE_RETARD', 'PROJET_RETARD', 'DOCUMENT_AJOUTE', 'DOCUMENT_MODIFIE', 'CHANGEMENT_STATUT');

-- CreateEnum
CREATE TYPE "PrioriteNotification" AS ENUM ('BASSE', 'MOYENNE', 'HAUTE');

-- CreateTable
CREATE TABLE "Etablissement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "sigle" TEXT,
    "logo_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Etablissement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "etablissement_id" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "derniere_connexion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partenaire" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "site_web" TEXT,
    "description" TEXT,
    "statut" "StatutPartenaire" NOT NULL DEFAULT 'ACTIF',
    "visibilite" "Visibilite" NOT NULL DEFAULT 'PRIVE',
    "est_strategique" BOOLEAN NOT NULL DEFAULT false,
    "logo_url" TEXT,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "etablissement_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partenaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "fonction" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "partenaire_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partenariat" (
    "id" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "objet" TEXT,
    "domaine" "DomainePartenariat" NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "statut" "StatutPartenariat" NOT NULL DEFAULT 'BROUILLON',
    "actions_realisees" TEXT,
    "actions_en_cours" TEXT,
    "actions_prevues" TEXT,
    "resultats_obtenus" TEXT,
    "difficultes_contraintes" TEXT,
    "perspectives_recommandations" TEXT,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partenariat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartenariatEtablissement" (
    "id" TEXT NOT NULL,
    "partenariat_id" TEXT NOT NULL,
    "etablissement_id" TEXT NOT NULL,

    CONSTRAINT "PartenariatEtablissement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartenariatPartenaire" (
    "id" TEXT NOT NULL,
    "partenariat_id" TEXT NOT NULL,
    "partenaire_id" TEXT NOT NULL,

    CONSTRAINT "PartenariatPartenaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CotutelleThese" (
    "id" TEXT NOT NULL,
    "nom_doctorant" TEXT NOT NULL,
    "specialite" TEXT,
    "directeur_these_local" TEXT,
    "directeur_these_partenaire" TEXT,
    "type" "TypeCotutelle" NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_prevue_soutenance" TIMESTAMP(3),
    "financement_bourse" TEXT,
    "mobilite_realisee" TEXT,
    "publications_produites" TEXT,
    "etat_avancement" TEXT,
    "difficultes_rencontrees" TEXT,
    "perspectives" TEXT,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "etablissement_id" TEXT NOT NULL,
    "partenaire_id" TEXT NOT NULL,
    "convention_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CotutelleThese_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projet" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "intitule_officiel" TEXT,
    "type" TEXT NOT NULL,
    "domaine" TEXT,
    "budget" DECIMAL(12,2),
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin_prevue" TIMESTAMP(3) NOT NULL,
    "statut" "StatutProjet" NOT NULL DEFAULT 'BROUILLON',
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "etablissement_id" TEXT NOT NULL,
    "partenariat_id" TEXT,
    "porteur_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjetPartenaire" (
    "id" TEXT NOT NULL,
    "projet_id" TEXT NOT NULL,
    "partenaire_id" TEXT NOT NULL,

    CONSTRAINT "ProjetPartenaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjetBeneficiaire" (
    "id" TEXT NOT NULL,
    "projet_id" TEXT NOT NULL,
    "beneficiaire_id" TEXT NOT NULL,

    CONSTRAINT "ProjetBeneficiaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjetBailleur" (
    "id" TEXT NOT NULL,
    "projet_id" TEXT NOT NULL,
    "bailleur_id" TEXT NOT NULL,

    CONSTRAINT "ProjetBailleur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjetSite" (
    "id" TEXT NOT NULL,
    "projet_id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,

    CONSTRAINT "ProjetSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Porteur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "institution_rattachement" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Porteur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bailleur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bailleur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiaire" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activite" (
    "id" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "terminee" BOOLEAN NOT NULL DEFAULT false,
    "date_echeance" TIMESTAMP(3),
    "projet_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chronogramme" (
    "id" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "trimestre" INTEGER NOT NULL,
    "mois" INTEGER NOT NULL,
    "nombre_jours" DECIMAL(6,1) NOT NULL,
    "activite_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chronogramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convention" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "date_signature" TIMESTAMP(3),
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "statut" "StatutConvention" NOT NULL DEFAULT 'BROUILLON',
    "etape_circuit" "EtapeCircuit" NOT NULL DEFAULT 'REDACTION',
    "date_derniere_etape" TIMESTAMP(3),
    "description" TEXT,
    "archive" BOOLEAN NOT NULL DEFAULT false,
    "partenariat_id" TEXT,
    "projet_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Convention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "nom_fichier" TEXT NOT NULL,
    "url_fichier" TEXT NOT NULL,
    "type" "TypeDocument" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "est_archive" BOOLEAN NOT NULL DEFAULT false,
    "projet_id" TEXT,
    "convention_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description_publique" TEXT,
    "date_publication" TIMESTAMP(3),
    "statut" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "resultats" TEXT,
    "projet_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoPublication" (
    "id" TEXT NOT NULL,
    "url_fichier" TEXT NOT NULL,
    "legende" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "publication_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhotoPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "priorite" "PrioriteNotification" NOT NULL DEFAULT 'MOYENNE',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "est_lue" BOOLEAN NOT NULL DEFAULT false,
    "utilisateur_id" TEXT NOT NULL,
    "reference_type" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyntheseItem" (
    "id" TEXT NOT NULL,
    "etablissement_id" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyntheseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SynthesePartenaireStrategique" (
    "id" TEXT NOT NULL,
    "etablissement_id" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "partenaire_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SynthesePartenaireStrategique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Etablissement_nom_idx" ON "Etablissement"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "Utilisateur_etablissement_id_idx" ON "Utilisateur"("etablissement_id");

-- CreateIndex
CREATE INDEX "Utilisateur_role_idx" ON "Utilisateur"("role");

-- CreateIndex
CREATE INDEX "Utilisateur_actif_idx" ON "Utilisateur"("actif");

-- CreateIndex
CREATE INDEX "Partenaire_etablissement_id_idx" ON "Partenaire"("etablissement_id");

-- CreateIndex
CREATE INDEX "Partenaire_archive_idx" ON "Partenaire"("archive");

-- CreateIndex
CREATE INDEX "Partenaire_nom_idx" ON "Partenaire"("nom");

-- CreateIndex
CREATE INDEX "Partenaire_statut_idx" ON "Partenaire"("statut");

-- CreateIndex
CREATE INDEX "Partenariat_archive_idx" ON "Partenariat"("archive");

-- CreateIndex
CREATE INDEX "Partenariat_statut_idx" ON "Partenariat"("statut");

-- CreateIndex
CREATE INDEX "Partenariat_date_debut_date_fin_idx" ON "Partenariat"("date_debut", "date_fin");

-- CreateIndex
CREATE UNIQUE INDEX "PartenariatEtablissement_partenariat_id_etablissement_id_key" ON "PartenariatEtablissement"("partenariat_id", "etablissement_id");

-- CreateIndex
CREATE UNIQUE INDEX "PartenariatPartenaire_partenariat_id_partenaire_id_key" ON "PartenariatPartenaire"("partenariat_id", "partenaire_id");

-- CreateIndex
CREATE INDEX "CotutelleThese_etablissement_id_idx" ON "CotutelleThese"("etablissement_id");

-- CreateIndex
CREATE INDEX "CotutelleThese_partenaire_id_idx" ON "CotutelleThese"("partenaire_id");

-- CreateIndex
CREATE INDEX "CotutelleThese_archive_idx" ON "CotutelleThese"("archive");

-- CreateIndex
CREATE INDEX "Projet_etablissement_id_idx" ON "Projet"("etablissement_id");

-- CreateIndex
CREATE INDEX "Projet_statut_idx" ON "Projet"("statut");

-- CreateIndex
CREATE INDEX "Projet_archive_idx" ON "Projet"("archive");

-- CreateIndex
CREATE INDEX "Projet_date_debut_date_fin_prevue_idx" ON "Projet"("date_debut", "date_fin_prevue");

-- CreateIndex
CREATE INDEX "Projet_partenariat_id_idx" ON "Projet"("partenariat_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjetPartenaire_projet_id_partenaire_id_key" ON "ProjetPartenaire"("projet_id", "partenaire_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjetBeneficiaire_projet_id_beneficiaire_id_key" ON "ProjetBeneficiaire"("projet_id", "beneficiaire_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjetBailleur_projet_id_bailleur_id_key" ON "ProjetBailleur"("projet_id", "bailleur_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProjetSite_projet_id_site_id_key" ON "ProjetSite"("projet_id", "site_id");

-- CreateIndex
CREATE INDEX "Activite_projet_id_idx" ON "Activite"("projet_id");

-- CreateIndex
CREATE INDEX "Activite_terminee_idx" ON "Activite"("terminee");

-- CreateIndex
CREATE INDEX "Activite_date_echeance_idx" ON "Activite"("date_echeance");

-- CreateIndex
CREATE INDEX "Chronogramme_activite_id_idx" ON "Chronogramme"("activite_id");

-- CreateIndex
CREATE UNIQUE INDEX "Chronogramme_activite_id_annee_trimestre_mois_key" ON "Chronogramme"("activite_id", "annee", "trimestre", "mois");

-- CreateIndex
CREATE UNIQUE INDEX "Convention_reference_key" ON "Convention"("reference");

-- CreateIndex
CREATE INDEX "Convention_reference_idx" ON "Convention"("reference");

-- CreateIndex
CREATE INDEX "Convention_statut_idx" ON "Convention"("statut");

-- CreateIndex
CREATE INDEX "Convention_date_debut_date_fin_idx" ON "Convention"("date_debut", "date_fin");

-- CreateIndex
CREATE INDEX "Convention_archive_idx" ON "Convention"("archive");

-- CreateIndex
CREATE INDEX "Convention_partenariat_id_idx" ON "Convention"("partenariat_id");

-- CreateIndex
CREATE INDEX "Convention_projet_id_idx" ON "Convention"("projet_id");

-- CreateIndex
CREATE INDEX "Document_projet_id_idx" ON "Document"("projet_id");

-- CreateIndex
CREATE INDEX "Document_convention_id_idx" ON "Document"("convention_id");

-- CreateIndex
CREATE INDEX "Document_est_archive_idx" ON "Document"("est_archive");

-- CreateIndex
CREATE UNIQUE INDEX "Publication_projet_id_key" ON "Publication"("projet_id");

-- CreateIndex
CREATE INDEX "Publication_statut_idx" ON "Publication"("statut");

-- CreateIndex
CREATE INDEX "PhotoPublication_publication_id_ordre_idx" ON "PhotoPublication"("publication_id", "ordre");

-- CreateIndex
CREATE INDEX "Notification_utilisateur_id_idx" ON "Notification"("utilisateur_id");

-- CreateIndex
CREATE INDEX "Notification_est_lue_idx" ON "Notification"("est_lue");

-- CreateIndex
CREATE INDEX "Notification_reference_type_reference_id_idx" ON "Notification"("reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "SyntheseItem_etablissement_id_annee_idx" ON "SyntheseItem"("etablissement_id", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "SyntheseItem_etablissement_id_annee_type_key" ON "SyntheseItem"("etablissement_id", "annee", "type");

-- CreateIndex
CREATE INDEX "SynthesePartenaireStrategique_etablissement_id_annee_idx" ON "SynthesePartenaireStrategique"("etablissement_id", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "SynthesePartenaireStrategique_etablissement_id_annee_parten_key" ON "SynthesePartenaireStrategique"("etablissement_id", "annee", "partenaire_id");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partenaire" ADD CONSTRAINT "Partenaire_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_partenaire_id_fkey" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartenariatEtablissement" ADD CONSTRAINT "PartenariatEtablissement_partenariat_id_fkey" FOREIGN KEY ("partenariat_id") REFERENCES "Partenariat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartenariatEtablissement" ADD CONSTRAINT "PartenariatEtablissement_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartenariatPartenaire" ADD CONSTRAINT "PartenariatPartenaire_partenariat_id_fkey" FOREIGN KEY ("partenariat_id") REFERENCES "Partenariat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartenariatPartenaire" ADD CONSTRAINT "PartenariatPartenaire_partenaire_id_fkey" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotutelleThese" ADD CONSTRAINT "CotutelleThese_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotutelleThese" ADD CONSTRAINT "CotutelleThese_partenaire_id_fkey" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CotutelleThese" ADD CONSTRAINT "CotutelleThese_convention_id_fkey" FOREIGN KEY ("convention_id") REFERENCES "Convention"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projet" ADD CONSTRAINT "Projet_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projet" ADD CONSTRAINT "Projet_partenariat_id_fkey" FOREIGN KEY ("partenariat_id") REFERENCES "Partenariat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projet" ADD CONSTRAINT "Projet_porteur_id_fkey" FOREIGN KEY ("porteur_id") REFERENCES "Porteur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetPartenaire" ADD CONSTRAINT "ProjetPartenaire_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetPartenaire" ADD CONSTRAINT "ProjetPartenaire_partenaire_id_fkey" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetBeneficiaire" ADD CONSTRAINT "ProjetBeneficiaire_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetBeneficiaire" ADD CONSTRAINT "ProjetBeneficiaire_beneficiaire_id_fkey" FOREIGN KEY ("beneficiaire_id") REFERENCES "Beneficiaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetBailleur" ADD CONSTRAINT "ProjetBailleur_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetBailleur" ADD CONSTRAINT "ProjetBailleur_bailleur_id_fkey" FOREIGN KEY ("bailleur_id") REFERENCES "Bailleur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetSite" ADD CONSTRAINT "ProjetSite_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetSite" ADD CONSTRAINT "ProjetSite_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activite" ADD CONSTRAINT "Activite_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chronogramme" ADD CONSTRAINT "Chronogramme_activite_id_fkey" FOREIGN KEY ("activite_id") REFERENCES "Activite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convention" ADD CONSTRAINT "Convention_partenariat_id_fkey" FOREIGN KEY ("partenariat_id") REFERENCES "Partenariat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convention" ADD CONSTRAINT "Convention_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_convention_id_fkey" FOREIGN KEY ("convention_id") REFERENCES "Convention"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_projet_id_fkey" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoPublication" ADD CONSTRAINT "PhotoPublication_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyntheseItem" ADD CONSTRAINT "SyntheseItem_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SynthesePartenaireStrategique" ADD CONSTRAINT "SynthesePartenaireStrategique_etablissement_id_fkey" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SynthesePartenaireStrategique" ADD CONSTRAINT "SynthesePartenaireStrategique_partenaire_id_fkey" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE ON UPDATE CASCADE;
