import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStockCheckConstraint1778423959451 implements MigrationInterface {
    name = 'AddStockCheckConstraint1778423959451'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "CHK_aea3ee263e1d44e36e5f5b5783" CHECK ("stock" >= 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "CHK_aea3ee263e1d44e36e5f5b5783"`);
    }

}
