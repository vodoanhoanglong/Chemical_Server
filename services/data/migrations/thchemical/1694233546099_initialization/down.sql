DROP INDEX  system_user_phone_unique;
DROP INDEX  system_user_email_unique; 
DROP INDEX  system_user_identity_unique; 

DROP TABLE "public"."contacts";
DROP TABLE "public"."blogs";
DROP TABLE "public"."products";
DROP TABLE "public"."categories";
DROP TABLE "public"."master_data";
DROP TABLE "public"."configurations";
DROP TABLE "public"."system_users";


DROP FUNCTION IF EXISTS "public"."lower_email";
DROP DOMAIN IF EXISTS email;
DROP DOMAIN IF EXISTS identity_card;
DROP DOMAIN IF EXISTS no_space;