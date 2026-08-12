import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepenses1786281983388 implements MigrationInterface {
    name = 'AddDepenses1786281983388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."depenses_categorie_enum" AS ENUM('Professionnelle', 'Personnelle')`);
        await queryRunner.query(`CREATE TABLE "depenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entreprise_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "titre" character varying NOT NULL, "categorie" "public"."depenses_categorie_enum" NOT NULL DEFAULT 'Professionnelle', "montant" numeric(14,2) NOT NULL, "note" text, "date_depense" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_aff8a5d136d64b19661ecd962eb" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "depenses"`);
        await queryRunner.query(`DROP TYPE "public"."depenses_categorie_enum"`);
    }

}
