DROP INDEX  system_user_phone_unique;
DROP INDEX  system_user_email_unique; 
DROP INDEX  system_user_identity_unique; 

DROP TABLE "public"."notification_reads";
DROP TABLE "public"."notifications";
DROP TABLE "public"."shared_videos";
DROP TABLE "public"."video_votes";
DROP TABLE "public"."system_users";


DROP FUNCTION IF EXISTS "public"."lower_email";
DROP DOMAIN IF EXISTS email;
DROP DOMAIN IF EXISTS identity_card;
DROP DOMAIN IF EXISTS no_space;