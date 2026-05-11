import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCoinToUser1778493224300 implements MigrationInterface {
    name = 'AddCoinToUser1778493224300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "coin" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "coin"`);
    }

}
