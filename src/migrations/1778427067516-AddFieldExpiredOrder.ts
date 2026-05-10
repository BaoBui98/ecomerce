import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldExpiredOrder1778427067516 implements MigrationInterface {
    name = 'AddFieldExpiredOrder1778427067516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "expiredAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "expiredAt"`);
    }

}
