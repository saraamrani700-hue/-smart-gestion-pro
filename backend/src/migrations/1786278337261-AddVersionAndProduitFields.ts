import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVersionAndProduitFields1786278337261 implements MigrationInterface {
    name = 'AddVersionAndProduitFields1786278337261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "produits" ADD "marque" character varying`);
        await queryRunner.query(`ALTER TABLE "produits" ADD "rayon" character varying`);
        await queryRunner.query(`ALTER TABLE "produits" ADD "date_expiration" date`);
        await queryRunner.query(`ALTER TABLE "bibliotheque_donnees" ADD "version" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bibliotheque_donnees" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "produits" DROP COLUMN "date_expiration"`);
        await queryRunner.query(`ALTER TABLE "produits" DROP COLUMN "rayon"`);
        await queryRunner.query(`ALTER TABLE "produits" DROP COLUMN "marque"`);
    }

}
