import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Schema initial de la plateforme (migration Prisma -> TypeORM).
 *
 * DDL genere automatiquement a partir des entites TypeORM, puis verifie
 * contre le schema Prisma historique (scripts/generer-migration-initiale.ts).
 * Ne pas modifier a la main : regenerer avec
 *   npx ts-node scripts/generer-migration-initiale.ts
 *
 * Les bases creees avant la bascule TypeORM possedent deja ces tables :
 * la migration ne fait rien si la table "Utilisateur" existe.
 */
export class InitSchema1791200000000 implements MigrationInterface {
  name = 'InitSchema1791200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Base initialisee par l'ancien outil de migration : rien a faire.
    if (await queryRunner.hasTable('Utilisateur')) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE "RefreshToken" ("id" text NOT NULL, "token_hash" character varying NOT NULL, "utilisateur_id" text NOT NULL, "expires_at" TIMESTAMP(3) NOT NULL, "revoked_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "UQ_9f238dea2cf25cddaaf8b6882cf" UNIQUE ("token_hash"), CONSTRAINT "PK_e5efef1572bd829464edc903d19" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_0d639006615d0b1842ef5774dc" ON "RefreshToken" ("revoked_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_a04bd0c6487a346eab78b64790" ON "RefreshToken" ("expires_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_8811831deaced8436aaf3daa10" ON "RefreshToken" ("utilisateur_id")
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."TypeNotification" AS ENUM('PROJET_SOUMIS', 'PARTENARIAT_SOUMIS', 'EXPIRATION_CONVENTION', 'CONVENTION_EXPIREE', 'ACTIVITE_ECHEANCE', 'ACTIVITE_RETARD', 'PROJET_RETARD', 'DOCUMENT_AJOUTE', 'DOCUMENT_MODIFIE', 'CHANGEMENT_STATUT')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."PrioriteNotification" AS ENUM('BASSE', 'MOYENNE', 'HAUTE')
    `);
    await queryRunner.query(`
      CREATE TABLE "Notification" ("id" text NOT NULL, "titre" character varying NOT NULL, "message" text NOT NULL, "type" "public"."TypeNotification" NOT NULL, "priorite" "public"."PrioriteNotification" NOT NULL DEFAULT 'MOYENNE', "date_creation" TIMESTAMP(3) NOT NULL, "est_lue" boolean NOT NULL DEFAULT false, "utilisateur_id" text NOT NULL, "reference_type" character varying NOT NULL, "reference_id" character varying NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_da18f6446b6fea585f01d03f56c" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_a84e9b8377d19bbf3c996ff8ec" ON "Notification" ("reference_type", "reference_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_689a6c2663f366d396d711f0c9" ON "Notification" ("est_lue")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_8ca0bf5dc68b33ef263ef41a67" ON "Notification" ("utilisateur_id")
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."Role" AS ENUM('PRESIDENCE', 'ETABLISSEMENT', 'DECIDEUR')
    `);
    await queryRunner.query(`
      CREATE TABLE "Utilisateur" ("id" text NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."Role" NOT NULL, "etablissement_id" text, "actif" boolean NOT NULL DEFAULT true, "derniere_connexion" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "UQ_b0697ae82e6387397692ff73178" UNIQUE ("email"), CONSTRAINT "PK_b6d98e517d379425e609f73a3a0" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_eb7ff1a7fefe8ce0714275abb8" ON "Utilisateur" ("actif")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ec85015edc0eea53cbf94fbdce" ON "Utilisateur" ("role")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_563d7e14db3414ba2124ca3598" ON "Utilisateur" ("etablissement_id")
    `);
    await queryRunner.query(`
      CREATE TABLE "Contact" ("id" text NOT NULL, "nom" character varying NOT NULL, "fonction" character varying, "email" character varying, "telephone" character varying, "partenaire_id" text NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_9d0ea6f3557586cef53e954d13a" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_54f1f4f6903d79b40ceae24bda" ON "Contact" ("partenaire_id")
    `);
    await queryRunner.query(`
      CREATE TABLE "PartenariatEtablissement" ("id" text NOT NULL, "partenariat_id" text NOT NULL, "etablissement_id" text NOT NULL, CONSTRAINT "UQ_a09c2148d62b591b8ba022768ea" UNIQUE ("partenariat_id", "etablissement_id"), CONSTRAINT "PK_2048d22883e426065208e1804bd" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE TABLE "Porteur" ("id" text NOT NULL, "nom" character varying NOT NULL, "institution_rattachement" character varying, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_9c927d238ccc23b495acd769b89" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE TABLE "ProjetPartenaire" ("id" text NOT NULL, "projet_id" text NOT NULL, "partenaire_id" text NOT NULL, CONSTRAINT "UQ_b144f0cc39698e39864f9a93e2a" UNIQUE ("projet_id", "partenaire_id"), CONSTRAINT "PK_a40dc8f466d0a258ecd3a2cd300" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE TABLE "Beneficiaire" ("id" text NOT NULL, "nom" character varying NOT NULL, "categorie" character varying, "description" text, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_385f8c5764fa3be11f06bb376ca" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE TABLE "ProjetBeneficiaire" ("id" text NOT NULL, "projet_id" text NOT NULL, "beneficiaire_id" text NOT NULL, CONSTRAINT "UQ_9e61a7d51cd402c0cec49f5e1f0" UNIQUE ("projet_id", "beneficiaire_id"), CONSTRAINT "PK_bad6337781727f9232afcd8efc7" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE TABLE "Bailleur" ("id" text NOT NULL, "nom" character varying NOT NULL, "description" text, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_e6ef972dbbba3fa5ce2a0f7ecb2" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE TABLE "ProjetBailleur" ("id" text NOT NULL, "projet_id" text NOT NULL, "bailleur_id" text NOT NULL, CONSTRAINT "UQ_9bd5bfe301595684e057dc6482a" UNIQUE ("projet_id", "bailleur_id"), CONSTRAINT "PK_b9d962c27da7f84e621026028dd" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE TABLE "Site" ("id" text NOT NULL, "nom" character varying NOT NULL, "description" text, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_a6ee17a68456d31e1f6c32e2885" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE TABLE "ProjetSite" ("id" text NOT NULL, "projet_id" text NOT NULL, "site_id" text NOT NULL, CONSTRAINT "UQ_68906f4b3150a8055d7152a4949" UNIQUE ("projet_id", "site_id"), CONSTRAINT "PK_c1347981b28cf535a87b0e574d4" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE TABLE "Activite" ("id" text NOT NULL, "intitule" character varying NOT NULL, "ordre" integer NOT NULL, "terminee" boolean NOT NULL DEFAULT false, "date_echeance" TIMESTAMP(3), "projet_id" text NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_c98bc7f6abee5256719c415e515" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_3c66238480d37942e629a25efc" ON "Activite" ("date_echeance")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_1ab7030b3d4810e00be5a29aa6" ON "Activite" ("terminee")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_0c7c9b5fab65167fc9e76d999b" ON "Activite" ("projet_id")
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."TypeCotutelle" AS ENUM('COTUTELLE', 'COENCADREMENT')
    `);
    await queryRunner.query(`
      CREATE TABLE "CotutelleThese" ("id" text NOT NULL, "nom_doctorant" character varying NOT NULL, "specialite" character varying, "directeur_these_local" character varying, "directeur_these_partenaire" character varying, "type" "public"."TypeCotutelle" NOT NULL, "date_debut" TIMESTAMP(3) NOT NULL, "date_prevue_soutenance" TIMESTAMP(3), "financement_bourse" character varying, "mobilite_realisee" text, "publications_produites" text, "etat_avancement" text, "difficultes_rencontrees" text, "perspectives" text, "archive" boolean NOT NULL DEFAULT false, "etablissement_id" text NOT NULL, "partenaire_id" text NOT NULL, "convention_id" text, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_31a374ed18c2825a33475cec566" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_d9ec4b40a6e2a44ac922c16bb2" ON "CotutelleThese" ("archive")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_2df88f4e77643be681e1951e40" ON "CotutelleThese" ("partenaire_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_688416cae6586fa505ec7773d2" ON "CotutelleThese" ("etablissement_id")
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."StatutConvention" AS ENUM('BROUILLON', 'EN_ATTENTE_SIGNATURE', 'SIGNEE', 'ACTIVE', 'SUSPENDUE', 'EXPIREE')
    `);
    await queryRunner.query(`
      CREATE TABLE "Convention" ("id" text NOT NULL, "reference" character varying NOT NULL, "titre" character varying NOT NULL, "date_signature" TIMESTAMP(3), "date_debut" TIMESTAMP(3), "date_fin" TIMESTAMP(3), "statut" "public"."StatutConvention" NOT NULL DEFAULT 'BROUILLON', "description" text, "archive" boolean NOT NULL DEFAULT false, "partenariat_id" text, "projet_id" text, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "UQ_084d4c6a57a16fe1b2f855c4e77" UNIQUE ("reference"), CONSTRAINT "PK_a029d71546f2a15573f12554f33" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ae4b63cb3529db494d4e7068dc" ON "Convention" ("projet_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_b2683f0715adda24668c29bc9d" ON "Convention" ("partenariat_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_68d100c3ced827c2ff16ae70b9" ON "Convention" ("archive")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_c9d6fbe3211e28c74e9324b086" ON "Convention" ("date_debut", "date_fin")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_46eb67eb8ad69afa41e61c58d0" ON "Convention" ("statut")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_084d4c6a57a16fe1b2f855c4e7" ON "Convention" ("reference")
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."TypeDocument" AS ENUM('TDR', 'DESCRIPTION', 'CONVENTION', 'AUTRE')
    `);
    await queryRunner.query(`
      CREATE TABLE "Document" ("id" text NOT NULL, "nom_fichier" character varying NOT NULL, "url_fichier" character varying NOT NULL, "type" "public"."TypeDocument" NOT NULL, "version" integer NOT NULL DEFAULT '1', "est_archive" boolean NOT NULL DEFAULT false, "projet_id" text, "convention_id" text, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_8cfa1dceffcc6e1abdddf58533d" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_53a011725b6338dc323fd42830" ON "Document" ("est_archive")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_316f3782b8a7bd18a2cdb02840" ON "Document" ("convention_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_383ed6e855e5e2170b14482429" ON "Document" ("projet_id")
    `);
    await queryRunner.query(`
      CREATE TABLE "PhotoPublication" ("id" text NOT NULL, "url_fichier" character varying NOT NULL, "legende" character varying, "ordre" integer NOT NULL DEFAULT '0', "publication_id" text NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_8cb5ae1bf1e2ac12a50bfbf4067" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_b496574b5e912737ac0974454f" ON "PhotoPublication" ("publication_id", "ordre")
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."StatutPublication" AS ENUM('BROUILLON', 'PUBLIEE')
    `);
    await queryRunner.query(`
      CREATE TABLE "Publication" ("id" text NOT NULL, "titre" character varying NOT NULL, "description_publique" text, "date_publication" TIMESTAMP(3), "statut" "public"."StatutPublication" NOT NULL DEFAULT 'BROUILLON', "resultats" text, "projet_id" text NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "UQ_9b7414ccfe2919be80775029951" UNIQUE ("projet_id"), CONSTRAINT "PK_427fcfc307098cb734296d01dbf" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_609fcf5d27f9cb12388b14c2e1" ON "Publication" ("statut")
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."StatutProjet" AS ENUM('BROUILLON', 'EN_ATTENTE', 'EN_COURS', 'SUSPENDU', 'EXPIRE', 'TERMINE')
    `);
    await queryRunner.query(`
      CREATE TABLE "Projet" ("id" text NOT NULL, "nom" character varying NOT NULL, "intitule_officiel" character varying, "type" character varying NOT NULL, "domaine" character varying, "budget" numeric(12,2), "date_debut" TIMESTAMP(3) NOT NULL, "date_fin_prevue" TIMESTAMP(3) NOT NULL, "statut" "public"."StatutProjet" NOT NULL DEFAULT 'BROUILLON', "archive" boolean NOT NULL DEFAULT false, "etablissement_id" text NOT NULL, "partenariat_id" text, "porteur_id" text, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_4a71510d24a5c1eadac143edd0f" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_67e6c61b2240d4cc151e6c85d7" ON "Projet" ("partenariat_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_b2f4a1806f9396b842ca540b54" ON "Projet" ("date_debut", "date_fin_prevue")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_3bc083bb6ce4d29a0b8e411772" ON "Projet" ("archive")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_8b28e0fbb3b1797b546bfbe302" ON "Projet" ("statut")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_2f90b65ce7859a2f8a8e6b1209" ON "Projet" ("etablissement_id")
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."DomainePartenariat" AS ENUM('RECHERCHE', 'FORMATION', 'INNOVATION', 'DEVELOPPEMENT', 'COOPERATION_INSTITUTIONNELLE', 'AUTRE')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."StatutPartenariat" AS ENUM('BROUILLON', 'EN_ATTENTE', 'EN_COURS', 'SUSPENDU', 'TERMINE')
    `);
    await queryRunner.query(`
      CREATE TABLE "Partenariat" ("id" text NOT NULL, "intitule" character varying NOT NULL, "objet" text, "domaine" "public"."DomainePartenariat" NOT NULL, "date_debut" TIMESTAMP(3) NOT NULL, "date_fin" TIMESTAMP(3), "statut" "public"."StatutPartenariat" NOT NULL DEFAULT 'BROUILLON', "actions_realisees" text, "actions_en_cours" text, "actions_prevues" text, "resultats_obtenus" text, "difficultes_contraintes" text, "perspectives_recommandations" text, "archive" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_a8cd2d94900ffd3a9381cfc6efb" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_b04f1cd728cb6c9fd5b6d350a4" ON "Partenariat" ("date_debut", "date_fin")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ce31f92ff662737e04bc1775b3" ON "Partenariat" ("statut")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_556ba68b840b3134ff13c51907" ON "Partenariat" ("archive")
    `);
    await queryRunner.query(`
      CREATE TABLE "PartenariatPartenaire" ("id" text NOT NULL, "partenariat_id" text NOT NULL, "partenaire_id" text NOT NULL, CONSTRAINT "UQ_34996a6ab8b1d5e288416583311" UNIQUE ("partenariat_id", "partenaire_id"), CONSTRAINT "PK_25231aeb10425a3aeb54c9e96df" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."StatutPartenaire" AS ENUM('ACTIF', 'SUSPENDU')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."Visibilite" AS ENUM('PUBLIC', 'PRIVE')
    `);
    await queryRunner.query(`
      CREATE TABLE "Partenaire" ("id" text NOT NULL, "nom" character varying NOT NULL, "type" character varying NOT NULL, "pays" character varying NOT NULL, "adresse" character varying, "telephone" character varying, "email" character varying, "site_web" character varying, "description" text, "statut" "public"."StatutPartenaire" NOT NULL DEFAULT 'ACTIF', "visibilite" "public"."Visibilite" NOT NULL DEFAULT 'PRIVE', "est_strategique" boolean NOT NULL DEFAULT false, "logo_url" character varying, "archive" boolean NOT NULL DEFAULT false, "etablissement_id" text NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_56967384446d03e75de4c787cfe" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_4a8b886af65114d8de89f82927" ON "Partenaire" ("statut")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_e61398bbf355d501d6b3917085" ON "Partenaire" ("nom")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_ae4ba814a7c2dd89194653ca47" ON "Partenaire" ("archive")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_dc13ef70dcf5e659be56a0cd8c" ON "Partenaire" ("etablissement_id")
    `);
    await queryRunner.query(`
      CREATE TABLE "SyntheseItem" ("id" text NOT NULL, "etablissement_id" text NOT NULL, "annee" integer NOT NULL, "type" character varying NOT NULL, "valeur" text NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "UQ_7a1402619202f223f719546928b" UNIQUE ("etablissement_id", "annee", "type"), CONSTRAINT "PK_595e5623987bb812980ad4af6c9" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_316a4c95b68de8324b9f74636c" ON "SyntheseItem" ("etablissement_id", "annee")
    `);
    await queryRunner.query(`
      CREATE TABLE "Etablissement" ("id" text NOT NULL, "nom" character varying NOT NULL, "sigle" character varying, "logo_url" character varying, "description" text, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_55cb403eea300a050b913dd5198" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_74d2c5bf5cfd0731bd0182661f" ON "Etablissement" ("nom")
    `);
    await queryRunner.query(`
      CREATE TABLE "SynthesePartenaireStrategique" ("id" text NOT NULL, "etablissement_id" text NOT NULL, "annee" integer NOT NULL, "partenaire_id" text NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "UQ_75ef1e81d754ac60e9a00e179c7" UNIQUE ("etablissement_id", "annee", "partenaire_id"), CONSTRAINT "PK_dbd0df40041e4bbb92c0a079fa8" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_b8c0149ff29ad76476df400d43" ON "SynthesePartenaireStrategique" ("etablissement_id", "annee")
    `);
    await queryRunner.query(`
      CREATE TABLE "Chronogramme" ("id" text NOT NULL, "annee" integer NOT NULL, "trimestre" integer NOT NULL, "mois" integer NOT NULL, "nombre_jours" numeric(6,1) NOT NULL, "activite_id" text NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "UQ_e45ff991142568b75e594fbdca7" UNIQUE ("activite_id", "annee", "trimestre", "mois"), CONSTRAINT "PK_20c4da05e38c25832ca269b8c3b" PRIMARY KEY ("id"))
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_16b24830d41432f177190b034a" ON "Chronogramme" ("activite_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "RefreshToken" ADD CONSTRAINT "FK_8811831deaced8436aaf3daa102" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Notification" ADD CONSTRAINT "FK_8ca0bf5dc68b33ef263ef41a671" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Utilisateur" ADD CONSTRAINT "FK_563d7e14db3414ba2124ca35982" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Contact" ADD CONSTRAINT "FK_54f1f4f6903d79b40ceae24bda2" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "PartenariatEtablissement" ADD CONSTRAINT "FK_fc7a2b69c2fd524fabcfa07d56b" FOREIGN KEY ("partenariat_id") REFERENCES "Partenariat"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "PartenariatEtablissement" ADD CONSTRAINT "FK_ee30714659f0e4cd1c968ee0ba3" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "ProjetPartenaire" ADD CONSTRAINT "FK_8acfefbcf69e3ab846a0a7413b2" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "ProjetPartenaire" ADD CONSTRAINT "FK_aa4a817e4cf7a798bbbdba0f5d2" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "ProjetBeneficiaire" ADD CONSTRAINT "FK_1b97266af3f6c5c2433dba41401" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "ProjetBeneficiaire" ADD CONSTRAINT "FK_7eecde8ce429c73f6544e184bd0" FOREIGN KEY ("beneficiaire_id") REFERENCES "Beneficiaire"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "ProjetBailleur" ADD CONSTRAINT "FK_35a6e4d2a44c1bfde62649365fc" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "ProjetBailleur" ADD CONSTRAINT "FK_913221830ffc7a175df70115ee2" FOREIGN KEY ("bailleur_id") REFERENCES "Bailleur"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "ProjetSite" ADD CONSTRAINT "FK_bf2f5b84596297711f7871b6aef" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "ProjetSite" ADD CONSTRAINT "FK_4112359d087038b100632f60090" FOREIGN KEY ("site_id") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Activite" ADD CONSTRAINT "FK_0c7c9b5fab65167fc9e76d999b7" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "CotutelleThese" ADD CONSTRAINT "FK_688416cae6586fa505ec7773d28" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "CotutelleThese" ADD CONSTRAINT "FK_2df88f4e77643be681e1951e40b" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "CotutelleThese" ADD CONSTRAINT "FK_ca405186830cbd53c32ab631b74" FOREIGN KEY ("convention_id") REFERENCES "Convention"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Convention" ADD CONSTRAINT "FK_b2683f0715adda24668c29bc9dc" FOREIGN KEY ("partenariat_id") REFERENCES "Partenariat"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Convention" ADD CONSTRAINT "FK_ae4b63cb3529db494d4e7068dcf" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Document" ADD CONSTRAINT "FK_383ed6e855e5e2170b14482429f" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Document" ADD CONSTRAINT "FK_316f3782b8a7bd18a2cdb028405" FOREIGN KEY ("convention_id") REFERENCES "Convention"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "PhotoPublication" ADD CONSTRAINT "FK_5a987f35d709c724bbb9b928790" FOREIGN KEY ("publication_id") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Publication" ADD CONSTRAINT "FK_9b7414ccfe2919be80775029951" FOREIGN KEY ("projet_id") REFERENCES "Projet"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Projet" ADD CONSTRAINT "FK_2f90b65ce7859a2f8a8e6b12090" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Projet" ADD CONSTRAINT "FK_67e6c61b2240d4cc151e6c85d78" FOREIGN KEY ("partenariat_id") REFERENCES "Partenariat"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Projet" ADD CONSTRAINT "FK_85110c8cf5d064270c3717e932c" FOREIGN KEY ("porteur_id") REFERENCES "Porteur"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "PartenariatPartenaire" ADD CONSTRAINT "FK_8244683c28c85a0f5524f34e6ca" FOREIGN KEY ("partenariat_id") REFERENCES "Partenariat"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "PartenariatPartenaire" ADD CONSTRAINT "FK_ccefc70f0fbb7eea2783868a466" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Partenaire" ADD CONSTRAINT "FK_dc13ef70dcf5e659be56a0cd8cd" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "SyntheseItem" ADD CONSTRAINT "FK_ff62be4331f7a36ff969c895d43" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "SynthesePartenaireStrategique" ADD CONSTRAINT "FK_2d0acab5c0247ffcf5f25f347ac" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "SynthesePartenaireStrategique" ADD CONSTRAINT "FK_cb92e56881d24f86c4d5e77b6b8" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "Chronogramme" ADD CONSTRAINT "FK_16b24830d41432f177190b034a3" FOREIGN KEY ("activite_id") REFERENCES "Activite"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "Chronogramme" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "SynthesePartenaireStrategique" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "Etablissement" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "SyntheseItem" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Partenaire" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "PartenariatPartenaire" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "Partenariat" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Projet" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Publication" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "PhotoPublication" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Document" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Convention" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "CotutelleThese" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Activite" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ProjetSite" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Site" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ProjetBailleur" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Bailleur" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "ProjetBeneficiaire" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "Beneficiaire" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ProjetPartenaire" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Porteur" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "PartenariatEtablissement" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "Contact" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Utilisateur" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "Notification" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "RefreshToken" CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."TypeNotification" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."PrioriteNotification" CASCADE`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."Role" CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."TypeCotutelle" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."StatutConvention" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."TypeDocument" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."StatutPublication" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."StatutProjet" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."DomainePartenariat" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."StatutPartenariat" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."StatutPartenaire" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."Visibilite" CASCADE`,
    );
  }
}
