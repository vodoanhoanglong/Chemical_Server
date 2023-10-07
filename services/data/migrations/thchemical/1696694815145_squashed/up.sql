
alter table "public"."contacts" add column "metadata" jsonb null;

alter table "public"."contacts" add constraint "contacts_phoneNumber_key" unique ("phoneNumber");
