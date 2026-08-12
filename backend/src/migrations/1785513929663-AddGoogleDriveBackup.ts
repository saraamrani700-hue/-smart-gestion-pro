import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleDriveBackup1785513929663 implements MigrationInterface {
    name = 'AddGoogleDriveBackup1785513929663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sauvegardes" ADD "google_drive_file_id" character varying`);
        await queryRunner.query(`ALTER TABLE "sauvegardes" ADD "google_drive_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sauvegardes" DROP COLUMN "google_drive_url"`);
        await queryRunner.query(`ALTER TABLE "sauvegardes" DROP COLUMN "google_drive_file_id"`);
    }

}
