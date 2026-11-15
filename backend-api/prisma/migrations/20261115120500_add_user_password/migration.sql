-- Add the required password column while preserving existing rows.
ALTER TABLE "users" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ALTER COLUMN "password" DROP DEFAULT;
