import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmployesInternes1786299274309 implements MigrationInterface {
    name = 'AddEmployesInternes1786299274309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employes_internes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entreprise_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "nom" character varying NOT NULL, "email" character varying, "role" character varying, "pin" character varying NOT NULL, "actif" boolean NOT NULL DEFAULT true, "permissions" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_f8f6b3cab59bb412ae2412358e9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "calculs_zakat" ALTER COLUMN "taux" SET DEFAULT '0.025'`);
        await queryRunner.query(`ALTER TABLE "lignes_bon_commande" ADD CONSTRAINT "FK_8337b2ddc9bc7edb74132dc3784" FOREIGN KEY ("produit_id") REFERENCES "produits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lignes_bon_commande" DROP CONSTRAINT "FK_8337b2ddc9bc7edb74132dc3784"`);
        await queryRunner.query(`ALTER TABLE "calculs_zakat" ALTER COLUMN "taux" SET DEFAULT 0.025`);
        await queryRunner.query(`DROP TABLE "employes_internes"`);
    }

}
