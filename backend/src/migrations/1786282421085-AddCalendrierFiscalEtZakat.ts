import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCalendrierFiscalEtZakat1786282421085 implements MigrationInterface {
    name = 'AddCalendrierFiscalEtZakat1786282421085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "calculs_zakat" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entreprise_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "valeur_stock" numeric(14,2) NOT NULL DEFAULT '0', "valeur_caisse" numeric(14,2) NOT NULL DEFAULT '0', "creances_clients" numeric(14,2) NOT NULL DEFAULT '0', "dettes_fournisseurs" numeric(14,2) NOT NULL DEFAULT '0', "base_zakatable" numeric(14,2) NOT NULL DEFAULT '0', "nisab" numeric(14,2) NOT NULL DEFAULT '0', "taux" numeric(5,4) NOT NULL DEFAULT '0.025', "zakat_due" numeric(14,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_a7bb52680bfe7b54c53ac410c0b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rappels_fiscaux" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entreprise_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "libelle" character varying NOT NULL, "date_echeance" date NOT NULL, "notes" text, "termine" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_32d62ebe6acc657874cd89a64bf" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "rappels_fiscaux"`);
        await queryRunner.query(`DROP TABLE "calculs_zakat"`);
    }

}
