import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOcrDonneesExtraites1785522890779 implements MigrationInterface {
    name = 'AddOcrDonneesExtraites1785522890779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ia_documents_analyses" ADD "donnees_extraites" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ia_documents_analyses" DROP COLUMN "donnees_extraites"`);
    }

}
