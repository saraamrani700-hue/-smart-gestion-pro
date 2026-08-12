import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPointsFidelite1786283003202 implements MigrationInterface {
    name = 'AddPointsFidelite1786283003202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ADD "points_fidelite" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "calculs_zakat" ALTER COLUMN "taux" SET DEFAULT '0.025'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "calculs_zakat" ALTER COLUMN "taux" SET DEFAULT 0.025`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "points_fidelite"`);
    }

}
