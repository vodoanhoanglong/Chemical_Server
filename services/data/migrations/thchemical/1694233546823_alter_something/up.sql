ALTER TABLE "public"."categories" DROP COLUMN images;

ALTER TABLE "public"."categories" ADD COLUMN image text;
ALTER TABLE "public"."categories" ADD COLUMN icon text;
