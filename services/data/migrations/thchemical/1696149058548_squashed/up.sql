
alter table "public"."products" add column "htmlContent" text null;

alter table "public"."products" add column "brandId" uuid null;

alter table "public"."products"
  add constraint "products_brandId_fkey"
  foreign key ("brandId")
  references "public"."master_data"
  ("id") on update restrict on delete restrict;

alter table "public"."master_data" add column "additionalValue" text null;
