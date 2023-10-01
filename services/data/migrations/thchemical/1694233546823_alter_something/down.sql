ALTER TABLE "public"."categories" ADD COLUMN images JSONB;

ALTER TABLE "public"."categories" DROP COLUMN image;
ALTER TABLE "public"."categories" DROP COLUMN icon;
