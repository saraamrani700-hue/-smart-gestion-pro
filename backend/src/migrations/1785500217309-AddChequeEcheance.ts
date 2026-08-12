import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChequeEcheance1785500217309 implements MigrationInterface {
    name = 'AddChequeEcheance1785500217309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cheques" ADD "date_echeance" date`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('info', 'alerte', 'erreur', 'stock_bas', 'paiement', 'cheque_echeance')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'info'`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('info', 'alerte', 'erreur', 'stock_bas', 'paiement')`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'info'`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`);
        await queryRunner.query(`ALTER TABLE "cheques" DROP COLUMN "date_echeance"`);
    }

}
