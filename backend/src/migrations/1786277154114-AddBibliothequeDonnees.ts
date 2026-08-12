import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBibliothequeDonnees1786277154114 implements MigrationInterface {
    name = 'AddBibliothequeDonnees1786277154114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bibliotheque_donnees" ("entreprise_id" uuid NOT NULL, "donnees" text NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0bb430904123ce965001856aaf7" PRIMARY KEY ("entreprise_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bibliotheque_donnees"`);
    }

}
