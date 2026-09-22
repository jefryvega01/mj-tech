ALTER TABLE "orders" ADD COLUMN "payment_method" text DEFAULT 'transferencia' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_proof_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "receipt_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "transfer_bank_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "transfer_account_type" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "transfer_account_number" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "transfer_holder_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "transfer_holder_rut" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "transfer_email" text DEFAULT '' NOT NULL;