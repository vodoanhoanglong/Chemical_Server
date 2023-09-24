INSERT INTO "public"."configurations" ("key", "value")
VALUES ('token_expire_time', '86400') ON CONFLICT DO NOTHING;