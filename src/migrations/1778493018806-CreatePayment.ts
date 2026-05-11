import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePayment1778493018806 implements MigrationInterface {
    name = 'CreatePayment1778493018806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payments_provider_enum" AS ENUM('STRIPE', 'VNPAY', 'MOMO')`);
        await queryRunner.query(`CREATE TYPE "public"."payments_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "provider" "public"."payments_provider_enum" NOT NULL, "providerSessionId" character varying, "providerTransactionId" character varying, "amount" numeric(15,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'VND', "status" "public"."payments_status_enum" NOT NULL DEFAULT 'PENDING', "checkoutUrl" character varying(500), "callbackUrl" character varying(500), "successUrl" character varying(500), "cancelUrl" character varying(500), "providerRequest" jsonb, "providerResponse" jsonb, "webhookPayload" jsonb, "failureCode" character varying, "failureMessage" character varying, "paidAt" TIMESTAMP, "expiredAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_provider_enum"`);
    }

}
