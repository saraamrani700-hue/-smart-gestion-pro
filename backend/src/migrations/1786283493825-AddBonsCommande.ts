import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBonsCommande1786283493825 implements MigrationInterface {
    name = 'AddBonsCommande1786283493825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bons_commande_statut_enum" AS ENUM('en_attente', 'recu')`);
        await queryRunner.query(`CREATE TABLE "bons_commande" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entreprise_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "numero" character varying NOT NULL, "fournisseur_id" uuid, "statut" "public"."bons_commande_statut_enum" NOT NULL DEFAULT 'en_attente', "total_ttc" numeric(14,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_0167941b0a2109b72da312d66b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lignes_bon_commande" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bon_commande_id" uuid NOT NULL, "produit_id" uuid, "designation" character varying, "quantite" numeric(14,3) NOT NULL, "prix_unitaire_ht" numeric(14,2) NOT NULL, CONSTRAINT "PK_388a9e3429ce7910a80bda0dc33" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "calculs_zakat" ALTER COLUMN "taux" SET DEFAULT '0.025'`);
        await queryRunner.query(`ALTER TABLE "lignes_bon_commande" ADD CONSTRAINT "FK_a1a8c1fbe57e51aa8297b7e718d" FOREIGN KEY ("bon_commande_id") REFERENCES "bons_commande"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lignes_bon_commande" DROP CONSTRAINT "FK_a1a8c1fbe57e51aa8297b7e718d"`);
        await queryRunner.query(`ALTER TABLE "calculs_zakat" ALTER COLUMN "taux" SET DEFAULT 0.025`);
        await queryRunner.query(`DROP TABLE "lignes_bon_commande"`);
        await queryRunner.query(`DROP TABLE "bons_commande"`);
        await queryRunner.query(`DROP TYPE "public"."bons_commande_statut_enum"`);
    }

}
