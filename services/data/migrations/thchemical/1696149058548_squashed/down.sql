
alter table "public"."master_data" drop column "additionalValue";

alter table "public"."products" drop constraint "products_brandId_fkey";

alter table "public"."products" drop column "brandId";

alter table "public"."products" drop column "htmlContent";
